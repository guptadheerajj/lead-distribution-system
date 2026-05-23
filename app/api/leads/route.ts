import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { AllocationError, assignProviders } from "@/lib/allocate";
import { prisma } from "@/lib/prisma";

const leadSchema = z.object({
	customerName: z.string().trim().min(1),
	phone: z.string().trim().min(1),
	city: z.string().trim().min(1),
	serviceId: z.coerce.number().int().positive(),
	description: z.string().trim().min(1),
});

export async function POST(request: Request) {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json(
			{ error: "Invalid JSON body." },
			{ status: 400 },
		);
	}

	const parsed = leadSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{
				error: "Invalid request data.",
				issues: parsed.error.flatten(),
			},
			{ status: 400 },
		);
	}

	const { customerName, phone, city, serviceId, description } = parsed.data;
	let createdLeadId: number | null = null;

	try {
		const lead = await prisma.lead.create({
			data: {
				customerName,
				phone,
				city,
				description,
				serviceId,
			},
		});

		createdLeadId = lead.id;
		const providerIds = await assignProviders(lead.id, lead.serviceId);

		return NextResponse.json(
			{ leadId: lead.id, providerIds },
			{ status: 201 },
		);
	} catch (error) {
		if (createdLeadId !== null) {
			try {
				await prisma.lead.delete({ where: { id: createdLeadId } });
			} catch {
				// Ignore cleanup failures to preserve original error behavior.
			}
		}

		if (error instanceof AllocationError) {
			const status =
				error.code === "ALLOCATION_INCOMPLETE"
					? 409
					: error.code === "SERVICE_NOT_FOUND" ||
						  error.code === "SERVICE_NOT_SUPPORTED"
						? 400
						: 500;

			return NextResponse.json(
				{ error: error.message, code: error.code },
				{ status },
			);
		}

		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2002"
		) {
			return NextResponse.json(
				{ error: "Duplicate lead for this service." },
				{ status: 409 },
			);
		}

		throw error;
	}
}
