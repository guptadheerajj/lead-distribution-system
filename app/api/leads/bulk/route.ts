import { z } from "zod";
import { NextResponse } from "next/server";

import { assignProviders, AllocationError } from "@/lib/allocate";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
	count: z.coerce.number().int().positive().max(50).default(10),
});

const services = [1, 2, 3];

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

	const tasks = Array.from({ length: count }).map(async (_, index) => {
		const serviceId = services[index % services.length];
		const leadData = {
			customerName: `Test User ${index + 1}`,
			phone: `90000000${(index + 1).toString().padStart(2, "0")}`,
			city: "Mumbai",
			description: "Bulk generated lead",
			serviceId,
		};

		let createdLeadId: number | null = null;

		try {
			const lead = await prisma.lead.create({ data: leadData });
			createdLeadId = lead.id;
			const providerIds = await assignProviders(lead.id, lead.serviceId);
			return { ok: true, leadId: lead.id, providerIds };
		} catch (error) {
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

			return { ok: false, message: "Failed to create lead." };
		}
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
