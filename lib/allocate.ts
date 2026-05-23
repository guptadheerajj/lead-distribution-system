import { Prisma, Provider } from "@prisma/client";
import { prisma } from "./prisma";

type ServiceConfig = {
	mandatoryProviders: string[];
	poolProviders: string[];
};

const MAX_ASSIGNMENTS = 3;
const MAX_RETRIES = 3;

const SERVICE_CONFIG: Record<string, ServiceConfig> = {
	"Service 1": {
		mandatoryProviders: ["Provider 1"],
		poolProviders: ["Provider 2", "Provider 3", "Provider 4"],
	},
	"Service 2": {
		mandatoryProviders: ["Provider 5"],
		poolProviders: ["Provider 6", "Provider 7", "Provider 8"],
	},
	"Service 3": {
		mandatoryProviders: ["Provider 1", "Provider 4"],
		poolProviders: [
			"Provider 2",
			"Provider 3",
			"Provider 5",
			"Provider 6",
			"Provider 7",
			"Provider 8",
		],
	},
};

export class AllocationError extends Error {
	code:
		| "ALLOCATION_INCOMPLETE"
		| "ALLOCATION_STATE_MISSING"
		| "SERVICE_NOT_SUPPORTED"
		| "SERVICE_NOT_FOUND"
		| "PROVIDER_NOT_FOUND";

	constructor(
		code:
			| "ALLOCATION_INCOMPLETE"
			| "ALLOCATION_STATE_MISSING"
			| "SERVICE_NOT_SUPPORTED"
			| "SERVICE_NOT_FOUND"
			| "PROVIDER_NOT_FOUND",
		message: string,
	) {
		super(message);
		this.code = code;
	}
}

const isRetryableTransactionError = (error: unknown): boolean => {
	return (
		error instanceof Prisma.PrismaClientKnownRequestError &&
		error.code === "P2034"
	);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const withTransactionRetries = async <T>(fn: () => Promise<T>): Promise<T> => {
	let attempt = 0;
	while (true) {
		try {
			return await fn();
		} catch (error) {
			if (!isRetryableTransactionError(error) || attempt >= MAX_RETRIES) {
				throw error;
			}
			attempt += 1;
			await sleep(25 * attempt);
		}
	}
};

const reserveProviderQuota = async (
	tx: Prisma.TransactionClient,
	provider: Provider,
): Promise<boolean> => {
	if (provider.leadsReceived >= provider.monthlyQuota) {
		return false;
	}

	const updated = await tx.provider.updateMany({
		where: {
			id: provider.id,
			leadsReceived: provider.leadsReceived,
		},
		data: {
			leadsReceived: { increment: 1 },
		},
	});

	if (updated.count === 1) {
		provider.leadsReceived += 1;
		return true;
	}

	return false;
};

export const assignProviders = async (
	leadId: number,
	serviceId: number,
): Promise<number[]> => {
	return withTransactionRetries(() =>
		prisma.$transaction(
			async (tx) => {
				const service = await tx.service.findUnique({
					where: { id: serviceId },
				});
				if (!service) {
					throw new AllocationError(
						"SERVICE_NOT_FOUND",
						`Service ${serviceId} not found.`,
					);
				}

				const config = SERVICE_CONFIG[service.name];
				if (!config) {
					throw new AllocationError(
						"SERVICE_NOT_SUPPORTED",
						`No allocation config for ${service.name}.`,
					);
				}

				const allocationState = await tx.allocationState.findUnique({
					where: { serviceId },
				});

				if (!allocationState) {
					throw new AllocationError(
						"ALLOCATION_STATE_MISSING",
						"AllocationState not seeded.",
					);
				}

				const providerNames = Array.from(
					new Set([...config.mandatoryProviders, ...config.poolProviders]),
				);

				const providers = await tx.provider.findMany({
					where: { name: { in: providerNames } },
				});

				const providersByName = new Map(
					providers.map((provider) => [provider.name, provider]),
				);

				const missingProviders = providerNames.filter(
					(name) => !providersByName.has(name),
				);
				if (missingProviders.length > 0) {
					throw new AllocationError(
						"PROVIDER_NOT_FOUND",
						`Missing providers: ${missingProviders.join(", ")}.`,
					);
				}

				const selectedIds = new Set<number>();
				const selectedList: number[] = [];

				for (const name of config.mandatoryProviders) {
					if (selectedIds.size >= MAX_ASSIGNMENTS) {
						break;
					}
					const provider = providersByName.get(name);
					if (!provider) {
						continue;
					}
					const reserved = await reserveProviderQuota(tx, provider);
					if (reserved) {
						selectedIds.add(provider.id);
						selectedList.push(provider.id);
					}
				}

				const poolProviders = config.poolProviders
					.map((name) => providersByName.get(name))
					.filter((provider): provider is Provider => Boolean(provider));

				const poolSize = poolProviders.length;
				if (selectedIds.size < MAX_ASSIGNMENTS && poolSize > 0) {
					const startIndex = allocationState.lastIndex % poolSize;
					let checked = 0;
					while (checked < poolSize && selectedIds.size < MAX_ASSIGNMENTS) {
						const index = (startIndex + checked) % poolSize;
						const provider = poolProviders[index];
						if (!selectedIds.has(provider.id)) {
							const reserved = await reserveProviderQuota(tx, provider);
							if (reserved) {
								selectedIds.add(provider.id);
								selectedList.push(provider.id);
							}
						}
						checked += 1;
					}

					const nextIndex = (startIndex + checked) % poolSize;
					await tx.allocationState.update({
						where: { serviceId },
						data: { lastIndex: nextIndex },
					});
				}

				if (selectedIds.size < MAX_ASSIGNMENTS) {
					throw new AllocationError(
						"ALLOCATION_INCOMPLETE",
						"Unable to allocate 3 providers for this lead.",
					);
				}

				await tx.leadAssignment.createMany({
					data: selectedList.map((providerId) => ({
						leadId,
						providerId,
					})),
				});

				return selectedList;
			},
			{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
		),
	);
};
