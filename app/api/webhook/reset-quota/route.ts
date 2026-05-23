import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
	eventId: z.string().trim().min(1),
	providerId: z.coerce.number().int().positive().optional(),
});

export async function POST(request: Request) {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
	}

	const parsed = payloadSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Invalid request data.", issues: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { eventId, providerId } = parsed.data;

	try {
		const result = await prisma.$transaction(async (tx) => {
			const existing = await tx.webhookEvent.findUnique({
				where: { eventId },
			});
			if (existing) {
				return { status: "already" as const };
			}

			if (providerId) {
				const provider = await tx.provider.findUnique({
					where: { id: providerId },
					select: { id: true },
				});
				if (!provider) {
					return { status: "not_found" as const };
				}
			}

			try {
				await tx.webhookEvent.create({ data: { eventId } });
			} catch (error) {
				if (
					error instanceof Prisma.PrismaClientKnownRequestError &&
					error.code === "P2002"
				) {
					return { status: "already" as const };
				}
				throw error;
			}

			if (providerId) {
				await tx.provider.update({
					where: { id: providerId },
					data: { leadsReceived: 0, monthlyQuota: 10 },
				});
			} else {
				await tx.provider.updateMany({
					data: { leadsReceived: 0, monthlyQuota: 10 },
				});
			}

			await tx.allocationState.updateMany({ data: { lastIndex: 0 } });

			return { status: "processed" as const };
		});

		if (result.status === "already") {
			return NextResponse.json({ message: "Already processed" });
		}

		if (result.status === "not_found") {
			return NextResponse.json(
				{ error: "Provider not found." },
				{ status: 404 },
			);
		}

		return NextResponse.json({ message: "Quota reset successful" });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to reset quota." },
			{ status: 500 },
		);
	}
}
