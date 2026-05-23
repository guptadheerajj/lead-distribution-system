import { Prisma } from "@prisma/client";
import { z } from "zod";
import { NextResponse } from "next/server";

import { assignProviders, AllocationError } from "@/lib/allocate";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const payloadSchema = z.object({
	count: z.coerce.number().int().positive().max(50).default(10),
});

const serviceNames = ["Service 1", "Service 2", "Service 3"];
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableConflict = (error: unknown) =>
	error instanceof Prisma.PrismaClientKnownRequestError &&
	error.code === "P2034";

export async function POST(request: Request) {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		payload = {};
	}

	const parsed = payloadSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Invalid request data.", issues: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { count } = parsed.data;
	const baseTime = Date.now();
	const runId = baseTime % 100000;

	const services = await prisma.service.findMany({
		where: { name: { in: serviceNames } },
		orderBy: { id: "asc" },
	});

	if (services.length === 0) {
		return NextResponse.json(
			{ error: "No services found for bulk lead generation." },
			{ status: 400 },
		);
	}

	const tasks = Array.from({ length: count }).map(async (_, index) => {
		const serviceId = services[index % services.length].id;
		const baseData = {
			customerName: `Test User ${runId}-${index + 1}`,
			city: "Mumbai",
			description: "Bulk generated lead",
			serviceId,
		};

		let lastError: unknown = null;

		for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
			const phone = `9${runId.toString().padStart(5, "0")}${index
				.toString()
				.padStart(3, "0")}${attempt}`;
			const leadData = { ...baseData, phone };
			let createdLeadId: number | null = null;

			try {
				const lead = await prisma.lead.create({ data: leadData });
				createdLeadId = lead.id;
				const providerIds = await assignProviders(lead.id, lead.serviceId);
				return { ok: true, leadId: lead.id, providerIds };
			} catch (error: unknown) {
				lastError = error;
				if (createdLeadId !== null) {
					try {
						await prisma.lead.delete({ where: { id: createdLeadId } });
					} catch {
						// Ignore cleanup failures.
					}
				}

				if (error instanceof AllocationError) {
					return { ok: false, code: error.code, message: error.message };
				}

				if (error instanceof Prisma.PrismaClientKnownRequestError) {
					if (error.code === "P2002") {
						return {
							ok: false,
							code: "DUPLICATE_LEAD",
							message: "Duplicate lead.",
						};
					}

					if (isRetryableConflict(error) && attempt < MAX_RETRIES - 1) {
						await sleep(40 * (attempt + 1));
						continue;
					}

					return {
						ok: false,
						code: error.code,
						message: error.message,
					};
				}

				if (isRetryableConflict(error) && attempt < MAX_RETRIES - 1) {
					await sleep(40 * (attempt + 1));
					continue;
				}
			}
		}

		if (
			lastError instanceof Prisma.PrismaClientKnownRequestError &&
			lastError.code
		) {
			return {
				ok: false,
				code: lastError.code,
				message: lastError.message,
			};
		}

		return { ok: false, message: "Failed to create lead." };
	});

	const results = await Promise.all(tasks);

	const summary = results.reduce(
		(acc, result) => {
			if (result.ok) {
				acc.succeeded += 1;
			} else {
				acc.failed += 1;
				acc.errors.push(result);
			}
			return acc;
		},
		{ succeeded: 0, failed: 0, errors: [] as Array<Record<string, unknown>> },
	);

	return NextResponse.json({
		count,
		requestedAt: baseTime,
		...summary,
		results,
	});
}
