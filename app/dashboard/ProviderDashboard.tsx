"use client";

import { useEffect, useRef, useState } from "react";

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

type Toast = {
	id: string;
	message: string;
};

export default function ProviderDashboard() {
	const [providers, setProviders] = useState<Provider[]>([]);
	const [status, setStatus] = useState<LoadState>("idle");
	const [error, setError] = useState<string | null>(null);
	const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
	const [updatePulse, setUpdatePulse] = useState(false);
	const [highlightTick, setHighlightTick] = useState(0);
	const [toasts, setToasts] = useState<Toast[]>([]);
	const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const highlightTimeoutsRef = useRef(
		new Map<number, ReturnType<typeof setTimeout>>(),
	);
	const recentlyUpdatedRef = useRef(new Set<number>());
	const previousProvidersRef = useRef<Provider[]>([]);

	const triggerPulse = () => {
		setUpdatePulse(true);
		if (pulseTimeoutRef.current) {
			clearTimeout(pulseTimeoutRef.current);
		}
		pulseTimeoutRef.current = setTimeout(() => {
			setUpdatePulse(false);
		}, 1800);
	};

	const pushToast = (message: string) => {
		const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
		setToasts((prev) => [{ id, message }, ...prev]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((toast) => toast.id !== id));
		}, 4000);
	};

	const highlightProvider = (providerId: number) => {
		recentlyUpdatedRef.current.add(providerId);
		setHighlightTick((value) => value + 1);

		const existing = highlightTimeoutsRef.current.get(providerId);
		if (existing) {
			clearTimeout(existing);
		}
		const timeout = setTimeout(() => {
			recentlyUpdatedRef.current.delete(providerId);
			highlightTimeoutsRef.current.delete(providerId);
			setHighlightTick((value) => value + 1);
		}, 2000);
		highlightTimeoutsRef.current.set(providerId, timeout);
	};

	useEffect(() => {
		setStatus("loading");
		setError(null);

		const source = new EventSource("/api/providers/updates");

		source.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data) as Provider[];
				const previous = previousProvidersRef.current;
				const previousById = new Map(previous.map((item) => [item.id, item]));
				const hasPrevious = previous.length > 0;

				let changed = false;
				if (hasPrevious) {
					for (const provider of data) {
						const prior = previousById.get(provider.id);
						if (!prior) {
							continue;
						}
						if (provider.leadsReceived > prior.leadsReceived) {
							changed = true;
							highlightProvider(provider.id);
							const latestAssignment = provider.leadAssignments[0];
							const serviceName =
								latestAssignment?.lead?.service?.name ?? "Unknown service";
							pushToast(
								`${provider.name} received a new lead — ${serviceName}`,
							);
						}
					}
				}

				setProviders(data);
				setStatus("ready");
				setError(null);
				if (!hasPrevious || changed) {
					setLastUpdatedAt(new Date().toLocaleTimeString());
					triggerPulse();
				}
				previousProvidersRef.current = data;
			} catch {
				setStatus("error");
				setError("Unable to parse provider updates.");
			}
		};

		source.onerror = () => {
			setStatus("error");
			setError("Realtime connection lost. Please refresh the page.");
			source.close();
		};

		return () => {
			source.close();
			if (pulseTimeoutRef.current) {
				clearTimeout(pulseTimeoutRef.current);
			}
			highlightTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
			highlightTimeoutsRef.current.clear();
		};
	}, []);

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-4">
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
					<div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
						<span
							className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold ${
								status === "error"
									? "bg-red-100 text-red-700"
									: updatePulse
										? "bg-emerald-100 text-emerald-700"
										: "bg-white/80 text-zinc-600"
							}`}
						>
							<span
								className={`h-2 w-2 rounded-full ${
									status === "error" ? "bg-red-500" : "bg-emerald-500"
								}`}
							/>
							{status === "error" ? "Disconnected" : "Live updates"}
						</span>
						<span>
							{updatePulse
								? "Updated just now"
								: lastUpdatedAt
									? `Last updated ${lastUpdatedAt}`
									: "Waiting for updates..."}
						</span>
					</div>
				</div>
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
					const isHighlighted = recentlyUpdatedRef.current.has(provider.id);

					return (
						<div
							key={provider.id}
							className={`rounded-3xl border border-zinc-900/10 bg-white/90 p-6 shadow-[0_16px_40px_rgba(24,24,27,0.12)] ${
								isHighlighted ? "ring-2 ring-yellow-400" : ""
							}`}
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

			<div className="fixed bottom-4 right-4 z-50 flex w-[320px] flex-col gap-2">
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm text-white shadow-xl"
					>
						{toast.message}
					</div>
				))}
			</div>
		</div>
	);
}
