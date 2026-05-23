import { prisma } from "@/lib/prisma";

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

				<form className="mt-8 space-y-5">
					<div className="grid gap-4 sm:grid-cols-2">
						<label className="flex flex-col gap-2 text-sm font-medium">
							Name
							<input
								name="customerName"
								placeholder="Jane Doe"
								className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:border-zinc-500 focus:outline-none"
							/>
						</label>
						<label className="flex flex-col gap-2 text-sm font-medium">
							Phone Number
							<input
								name="phone"
								placeholder="9999999999"
								className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:border-zinc-500 focus:outline-none"
							/>
						</label>
					</div>

					<label className="flex flex-col gap-2 text-sm font-medium">
						City
						<input
							name="city"
							placeholder="Bengaluru"
							className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:border-zinc-500 focus:outline-none"
						/>
					</label>

					<label className="flex flex-col gap-2 text-sm font-medium">
						Service Type
						<select
							name="serviceId"
							defaultValue=""
							className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:border-zinc-500 focus:outline-none"
						>
							<option value="" disabled>
								Select a service
							</option>
							{services.map((service) => (
								<option key={service.id} value={service.id}>
									{service.name}
								</option>
							))}
						</select>
					</label>

					<label className="flex flex-col gap-2 text-sm font-medium">
						Description
						<textarea
							name="description"
							rows={4}
							placeholder="Tell us more about your request"
							className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
						/>
					</label>

					<button
						type="button"
						className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white"
					>
						Submit Request
					</button>
				</form>
			</div>
		</div>
	);
}
