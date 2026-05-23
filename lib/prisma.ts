import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("Missing DIRECT_URL or DATABASE_URL for Prisma client.");
}

const adapter = new PrismaPg({ connectionString });

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

const prismaLog = process.env.PRISMA_QUERY_LOG === "true" ? ["query" as const] : [];

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: prismaLog,
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
