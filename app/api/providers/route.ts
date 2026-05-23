import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
	try {
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
	} catch {
		return NextResponse.json(
			{ error: "Failed to load providers." },
			{ status: 500 },
		);
	}
}
