import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("Missing DIRECT_URL or DATABASE_URL for seeding");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("Seeding...");

	// Create 3 services
	const service1 = await prisma.service.upsert({
		where: { name: "Service 1" },
		update: {},
		create: { name: "Service 1" },
	});
	const service2 = await prisma.service.upsert({
		where: { name: "Service 2" },
		update: {},
		create: { name: "Service 2" },
	});
	const service3 = await prisma.service.upsert({
		where: { name: "Service 3" },
		update: {},
		create: { name: "Service 3" },
	});

	// Create 8 providers
	for (let i = 1; i <= 8; i++) {
		await prisma.provider.upsert({
			where: { name: `Provider ${i}` },
			update: {},
			create: { name: `Provider ${i}`, monthlyQuota: 10, leadsReceived: 0 },
		});
	}

	// Create allocation state rows (one per service, lastIndex = 0)
	for (const service of [service1, service2, service3]) {
		await prisma.allocationState.upsert({
			where: { serviceId: service.id },
			update: {},
			create: { serviceId: service.id, lastIndex: 0 },
		});
	}

	console.log("Seed complete");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
