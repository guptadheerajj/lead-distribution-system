import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
	const providers = await prisma.provider.findMany({
		orderBy: { id: "asc" },
		include: {
			leadAssignments: {
				orderBy: { assignedAt: "desc" },
				include: {
					lead: {
						include: { service: true },
					},
				},
			},
		},
	});

	return NextResponse.json({ providers });
}
