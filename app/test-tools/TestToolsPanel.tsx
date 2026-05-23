"use client";

import { useState } from "react";

type LogEntry = {
	id: string;
	timestamp: string;
	message: string;
	payload?: unknown;
};

const MAX_LOGS = 20;

const formatTimestamp = () => new Date().toLocaleTimeString();

export default function TestToolsPanel() {
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [busy, setBusy] = useState<string | null>(null);

	const addLog = (message: string, payload?: unknown) => {
		setLogs((prev) => {
			const entry: LogEntry = {
				id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
				timestamp: formatTimestamp(),
				message,
				payload,
			};
			return [entry, ...prev].slice(0, MAX_LOGS);
		});
	};

	const postJson = async (url: string, body: unknown) => {
		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const payload = await response.json().catch(() => ({}));

		return { ok: response.ok, status: response.status, payload };
	};

	const handleResetAll = async () => {
		setBusy("reset");
		const eventId = `reset-all-${Date.now()}`;
		const result = await postJson("/api/webhook/reset-quota", { eventId });
		addLog("Reset all quotas", { eventId, ...result });
		setBusy(null);
	};

	const handleIdempotencyTest = async () => {
		setBusy("idempotency");
		const eventId = `idempotency-test-${Date.now()}`;
		const calls = Array.from({ length: 5 }).map(() =>
			postJson("/api/webhook/reset-quota", { eventId }),
		);
		const results = await Promise.all(calls);
		addLog("Webhook idempotency test (5x)", { eventId, results });
		setBusy(null);
	};

	const handleBulkLeads = async () => {
		setBusy("bulk");
		const result = await postJson("/api/leads/bulk", { count: 10 });
		addLog("Generated 10 leads", result);
		setBusy(null);
	};

	return (
		<div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
			<section className="rounded-3xl border border-zinc-900/10 bg-white/90 p-6 shadow-[0_16px_40px_rgba(24,24,27,0.12)]">
				<h2 className="text-xl font-semibold text-zinc-900">Test Actions</h2>
				<p className="mt-2 text-sm text-zinc-600">
					Trigger webhook flows and generate leads for evaluation.
				</p>

				<div className="mt-6 flex flex-col gap-3">
					<button
						onClick={handleResetAll}
						disabled={busy === "reset"}
						className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
					>
						{busy === "reset" ? "Resetting..." : "Reset All Quotas"}
					</button>
					<button
						onClick={handleIdempotencyTest}
						disabled={busy === "idempotency"}
						className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-900/10 bg-white px-5 text-sm font-semibold text-zinc-900 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{busy === "idempotency"
							? "Testing..."
							: "Call Webhook 5x (Idempotency)"}
					</button>
					<button
						onClick={handleBulkLeads}
						disabled={busy === "bulk"}
						className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-900/10 bg-white px-5 text-sm font-semibold text-zinc-900 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{busy === "bulk" ? "Generating..." : "Generate 10 Leads"}
					</button>
				</div>
			</section>

			<section className="rounded-3xl border border-zinc-900/10 bg-white/90 p-6 shadow-[0_16px_40px_rgba(24,24,27,0.12)]">
				<h2 className="text-xl font-semibold text-zinc-900">Activity Log</h2>
				<p className="mt-2 text-sm text-zinc-600">
					Newest entries appear on top (max {MAX_LOGS}).
				</p>
				<div className="mt-4 space-y-3">
					{logs.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500">
							No actions yet.
						</div>
					) : (
						logs.map((entry) => (
							<div
								key={entry.id}
								className="rounded-2xl border border-zinc-900/10 bg-zinc-50 p-4 text-sm"
							>
								<div className="flex items-center justify-between gap-3">
									<p className="font-semibold text-zinc-900">{entry.message}</p>
									<span className="text-xs text-zinc-500">
										{entry.timestamp}
									</span>
								</div>
								{entry.payload ? (
									<pre className="mt-3 overflow-auto rounded-xl bg-white/80 p-3 text-xs text-zinc-700">
										{JSON.stringify(entry.payload, null, 2)}
									</pre>
								) : null}
							</div>
						))
					)}
				</div>
			</section>
		</div>
	);
}
