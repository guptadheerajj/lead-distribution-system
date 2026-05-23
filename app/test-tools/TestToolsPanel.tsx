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

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const getMessage = (value: unknown): string | null => {
	if (!isRecord(value)) {
		return null;
	}
	if (typeof value.message === "string") {
		return value.message;
	}
	if (typeof value.error === "string") {
		return value.error;
	}
	return null;
};

const getResults = (payload: Record<string, unknown>) => {
	if (Array.isArray(payload.results)) {
		return payload.results;
	}
	if (isRecord(payload.payload) && Array.isArray(payload.payload.results)) {
		return payload.payload.results;
	}
	return null;
};

const getSummary = (payload: Record<string, unknown>) => {
	const source = isRecord(payload.payload) ? payload.payload : payload;
	const succeeded =
		typeof source.succeeded === "number" ? source.succeeded : null;
	const failed = typeof source.failed === "number" ? source.failed : null;
	const errors = Array.isArray(source.errors) ? source.errors.length : null;

	return { succeeded, failed, errors };
};

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
						className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
					>
						{busy === "reset" ? "Resetting..." : "Reset All Quotas"}
					</button>
					<button
						onClick={handleIdempotencyTest}
						disabled={busy === "idempotency"}
						className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-900/10 bg-white px-6 text-base font-semibold text-zinc-900 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{busy === "idempotency"
							? "Testing..."
							: "Call Webhook 5x (Idempotency)"}
					</button>
					<button
						onClick={handleBulkLeads}
						disabled={busy === "bulk"}
						className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-900/10 bg-white px-6 text-base font-semibold text-zinc-900 disabled:cursor-not-allowed disabled:opacity-70"
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
								{entry.payload && isRecord(entry.payload) ? (
									<div className="mt-3 rounded-xl border border-zinc-900/10 bg-white/80 p-3">
										<div className="flex flex-wrap items-center gap-3 text-xs">
											{typeof entry.payload.eventId === "string" ? (
												<span className="rounded-full border border-zinc-900/10 bg-white px-2 py-1 text-zinc-600">
													eventId: {entry.payload.eventId}
												</span>
											) : null}
											{typeof entry.payload.status === "number" ? (
												<span className="rounded-full border border-zinc-900/10 bg-white px-2 py-1 text-zinc-600">
													status: {entry.payload.status}
												</span>
											) : null}
											{typeof entry.payload.ok === "boolean" ? (
												<span
													className={`rounded-full px-2 py-1 ${
														entry.payload.ok
															? "bg-emerald-100 text-emerald-700"
															: "bg-red-100 text-red-700"
													}`}
												>
													{entry.payload.ok ? "success" : "failed"}
												</span>
											) : null}
										</div>

										{getMessage(entry.payload.payload) ? (
											<p className="mt-2 text-sm font-medium text-zinc-700">
												{getMessage(entry.payload.payload)}
											</p>
										) : null}

										{(() => {
											const summary = getSummary(entry.payload);
											if (
												summary.succeeded === null &&
												summary.failed === null
											) {
												return null;
											}

											return (
												<div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-600">
													{summary.succeeded !== null ? (
														<span>Succeeded: {summary.succeeded}</span>
													) : null}
													{summary.failed !== null ? (
														<span>Failed: {summary.failed}</span>
													) : null}
													{summary.errors !== null ? (
														<span>Errors: {summary.errors}</span>
													) : null}
												</div>
											);
										})()}

										{(() => {
											const results = getResults(entry.payload);
											if (!results) {
												return null;
											}

											return (
												<ul className="mt-3 space-y-2 text-xs text-zinc-600">
													{results.map((result, index) => {
														if (!isRecord(result)) {
															return null;
														}
														const message =
															getMessage(result.payload) ?? getMessage(result);
														const status =
															typeof result.status === "number"
																? result.status
																: null;
														const ok =
															typeof result.ok === "boolean" ? result.ok : null;

														return (
															<li
																key={`${entry.id}-result-${index}`}
																className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-900/10 bg-white px-3 py-2"
															>
																<span className="text-[11px] text-zinc-400">
																	#{index + 1}
																</span>
																{status !== null ? (
																	<span className="text-[11px] text-zinc-500">
																		status {status}
																	</span>
																) : null}
																{ok !== null ? (
																	<span
																		className={`text-[11px] font-semibold ${
																			ok ? "text-emerald-600" : "text-red-600"
																		}`}
																	>
																		{ok ? "ok" : "fail"}
																	</span>
																) : null}
																{message ? <span>{message}</span> : null}
															</li>
														);
													})}
												</ul>
											);
										})()}

										<details className="mt-3 text-xs text-zinc-500">
											<summary className="cursor-pointer select-none">
												View raw payload
											</summary>
											<pre className="mt-2 overflow-auto rounded-lg bg-white p-3 text-[11px] text-zinc-600">
												{JSON.stringify(entry.payload, null, 2)}
											</pre>
										</details>
									</div>
								) : null}
							</div>
						))
					)}
				</div>
			</section>
		</div>
	);
}
