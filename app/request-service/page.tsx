import { prisma } from "@/lib/prisma";
import RequestServiceForm from "./RequestServiceForm";

export default async function RequestServicePage() {
	const services = await prisma.service.findMany({
		orderBy: { id: "asc" },
	});

	return (
		<div className="flex min-h-screen flex-col items-center bg-zinc-50 px-6 py-16 text-zinc-950">
			<div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
				<h1 className="text-3xl font-semibold tracking-tight">
					Request a Service
				</h1>
				<p className="mt-2 text-sm text-zinc-600">
					Share your details and we will match you with providers.
				</p>

				<RequestServiceForm services={services} />
			</div>
		</div>
	);
}
