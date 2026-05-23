"use client";

import { useCallback, useEffect, useState } from "react";

type LeadSummary = {
	customerName: string;
	city: string;
	service: { name: string };
};

type LeadAssignment = {
	id: number;
	assignedAt: string;
	lead: LeadSummary;
};

type Provider = {
	id: number;
	name: string;
	monthlyQuota: number;
	leadsReceived: number;
	leadAssignments: LeadAssignment[];
};

type LoadState = "idle" | "loading" | "ready" | "error";

export default function ProviderDashboard() {
	const [providers, setProviders] = useState<Provider[]>([]);
	const [status, setStatus] = useState<LoadState>("idle");
	const [error, setError] = useState<string | null>(null);

	const loadProviders = useCallback(async () => {
		setStatus("loading");
		setError(null);

		try {
			const response = await fetch("/api/providers", {
				method: "GET",
				cache: "no-store",
			});
			const body = await response.json().catch(() => ({}));

			if (!response.ok) {
				throw new Error(body?.error ?? "Unable to load provider data.");
			}

			setProviders(body.providers ?? []);
			setStatus("ready");
		} catch (err) {
			setStatus("error");
			setError(err instanceof Error ? err.message : "Request failed.");
		}
	}, []);

	useEffect(() => {
		loadProviders();
	}, [loadProviders]);

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
						Provider dashboard
					</p>
					<h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
						Live lead assignments
					</h1>
					<p className="mt-2 text-sm text-zinc-600">
						Review quotas and the latest leads assigned to each provider.
					</p>
				</div>
				<button
					onClick={loadProviders}
					disabled={status === "loading"}
					className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-900/10 bg-white/80 px-4 text-xs font-semibold text-zinc-900 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{status === "loading" ? "Refreshing..." : "Refresh"}
				</button>
			</div>

			{status === "error" ? (
				<div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{error ?? "Unable to load provider data."}
				</div>
			) : null}

			{status === "loading" && providers.length === 0 ? (
				<div className="rounded-2xl border border-zinc-900/10 bg-white/80 p-6 text-sm text-zinc-600">
					Loading providers...
				</div>
			) : null}

			<div className="grid gap-6 lg:grid-cols-2">
				{providers.map((provider) => {
					const remaining = Math.max(
						provider.monthlyQuota - provider.leadsReceived,
						0,
					);

					return (
						<div
							key={provider.id}
							className="rounded-3xl border border-zinc-900/10 bg-white/90 p-6 shadow-[0_16px_40px_rgba(24,24,27,0.12)]"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-semibold text-zinc-900">
										{provider.name}
									</p>
									<p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
										Quota status
									</p>
								</div>
								<div className="text-right">
									<p className="text-sm font-semibold text-zinc-900">
										{provider.leadsReceived} / {provider.monthlyQuota}
									</p>
									<p className="text-xs text-zinc-500">{remaining} remaining</p>
								</div>
							</div>

							<div className="mt-5 border-t border-zinc-900/10 pt-4">
								<p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
									Assigned leads
								</p>
								{provider.leadAssignments.length === 0 ? (
									<p className="mt-3 text-sm text-zinc-600">
										No leads assigned yet.
									</p>
								) : (
									<ul className="mt-3 space-y-3">
										{provider.leadAssignments.map((assignment) => (
											<li
												key={assignment.id}
												className="rounded-2xl border border-zinc-900/10 bg-zinc-50 px-4 py-3"
											>
												<p className="text-sm font-semibold text-zinc-900">
													{assignment.lead.customerName}
												</p>
												<p className="text-xs text-zinc-600">
													{assignment.lead.service.name} ·{" "}
													{assignment.lead.city}
												</p>
												<p className="mt-1 text-xs text-zinc-500">
													Assigned{" "}
													{new Date(assignment.assignedAt).toLocaleString()}
												</p>
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
