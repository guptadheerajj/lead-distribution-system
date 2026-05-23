import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const encoder = new TextEncoder();

const toSsePayload = (data: unknown) => `data: ${JSON.stringify(data)}\n\n`;

const fetchProviders = () =>
	prisma.provider.findMany({
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

export async function GET(request: Request) {
	let intervalId: ReturnType<typeof setInterval> | null = null;

	const stream = new ReadableStream({
		start(controller) {
			let sending = false;

			const sendUpdate = async () => {
				if (sending) {
					return;
				}
				sending = true;
				try {
					const providers = await fetchProviders();
					controller.enqueue(encoder.encode(toSsePayload(providers)));
				} catch {
					controller.enqueue(
						encoder.encode(
							`event: error\ndata: ${JSON.stringify({
								error: "Failed to load providers.",
							})}\n\n`,
						),
					);
				} finally {
					sending = false;
				}
			};

			void sendUpdate();
			intervalId = setInterval(sendUpdate, 3000);

			const close = () => {
				if (intervalId) {
					clearInterval(intervalId);
					intervalId = null;
				}
				controller.close();
			};

			request.signal.addEventListener("abort", close, { once: true });
		},
		cancel() {
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
		},
	});
}
