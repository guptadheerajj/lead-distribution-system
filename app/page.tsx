import Link from "next/link";
import SiteHeader from "./components/SiteHeader";

export default function Home() {
	return (
		<div className="relative min-h-screen overflow-hidden bg-[#f6f1e8] text-zinc-900">
			<div
				className="absolute inset-0 -z-10"
				style={{
					backgroundImage:
						"radial-gradient(circle at top, rgba(255, 214, 165, 0.7), transparent 55%), radial-gradient(circle at 85% 20%, rgba(170, 231, 220, 0.7), transparent 45%), radial-gradient(circle at 10% 85%, rgba(248, 186, 153, 0.6), transparent 55%)",
				}}
			/>
			<div
				className="absolute inset-0 -z-10 opacity-40"
				style={{
					backgroundImage:
						"linear-gradient(rgba(24, 24, 27, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(24, 24, 27, 0.08) 1px, transparent 1px)",
					backgroundSize: "120px 120px",
					backgroundPosition: "center",
				}}
			/>

			<SiteHeader title="Lead Distribution" />

			<main className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 pt-12 lg:grid-cols-[1.1fr_0.9fr]">
				<section className="flex flex-col gap-8">
					<div className="flex flex-col gap-5">
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
							Fair allocation engine
						</p>
						<h1 className="text-4xl font-semibold leading-tight text-zinc-950 sm:text-5xl">
							Route every lead to the right providers with strict fairness.
						</h1>
						<p className="max-w-xl text-lg text-zinc-700">
							Mandatory assignments, quota limits, round robin distribution, and
							real-time dashboards. The system stays consistent under
							concurrency and keeps provider rotations honest.
						</p>
						<div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-600">
							<span className="rounded-full border border-zinc-900/10 bg-white/80 px-3 py-1">
								Prisma + Postgres
							</span>
							<span className="rounded-full border border-zinc-900/10 bg-white/80 px-3 py-1">
								Realtime ready
							</span>
						</div>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row">
						<Link
							className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-900/15 transition-transform duration-200 hover:-translate-y-0.5"
							href="/request-service"
						>
							Request a Service
						</Link>
						<Link
							className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-900/10 bg-white/80 px-6 text-sm font-semibold text-zinc-900 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
							href="/dashboard"
						>
							View Provider Dashboard
						</Link>
						<Link
							className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-900/10 bg-white/80 px-6 text-sm font-semibold text-zinc-900 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
							href="/test-tools"
						>
							Open Test Tools
						</Link>
					</div>

					<div className="grid gap-4 sm:grid-cols-3">
						<div className="rounded-2xl border border-zinc-900/10 bg-white/85 p-4 animate-fade-up">
							<p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
								Quota
							</p>
							<p className="mt-2 text-2xl font-semibold text-zinc-900">10</p>
							<p className="text-xs text-zinc-600">Leads per provider</p>
						</div>
						<div
							className="rounded-2xl border border-zinc-900/10 bg-white/85 p-4 animate-fade-up"
							style={{ animationDelay: "140ms" }}
						>
							<p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
								Assignments
							</p>
							<p className="mt-2 text-2xl font-semibold text-zinc-900">3</p>
							<p className="text-xs text-zinc-600">Providers per lead</p>
						</div>
						<div
							className="rounded-2xl border border-zinc-900/10 bg-white/85 p-4 animate-fade-up"
							style={{ animationDelay: "280ms" }}
						>
							<p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
								Rotation
							</p>
							<p className="mt-2 text-2xl font-semibold text-zinc-900">RR</p>
							<p className="text-xs text-zinc-600">Round robin state</p>
						</div>
					</div>
				</section>

				<section className="relative">
					<div className="rounded-3xl border border-zinc-900/10 bg-white/90 p-6 shadow-[0_20px_60px_rgba(24,24,27,0.15)]">
						<div className="flex items-center justify-between">
							<p className="text-sm font-semibold text-zinc-900">
								Allocation Playbook
							</p>
							<span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">
								Live
							</span>
						</div>
						<ul className="mt-6 space-y-4 text-sm text-zinc-700">
							<li className="flex gap-3">
								<span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
									1
								</span>
								<div>
									<p className="font-semibold text-zinc-900">Capture lead</p>
									<p className="text-xs text-zinc-600">
										Validated inputs and duplicate prevention.
									</p>
								</div>
							</li>
							<li className="flex gap-3">
								<span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
									2
								</span>
								<div>
									<p className="font-semibold text-zinc-900">
										Apply mandatory rules
									</p>
									<p className="text-xs text-zinc-600">
										Always-on providers for each service line.
									</p>
								</div>
							</li>
							<li className="flex gap-3">
								<span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
									3
								</span>
								<div>
									<p className="font-semibold text-zinc-900">
										Round robin pool
									</p>
									<p className="text-xs text-zinc-600">
										Quota aware selection with persisted cursor.
									</p>
								</div>
							</li>
							<li className="flex gap-3">
								<span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
									4
								</span>
								<div>
									<p className="font-semibold text-zinc-900">
										Instant delivery
									</p>
									<p className="text-xs text-zinc-600">
										Dashboards update without reloads.
									</p>
								</div>
							</li>
						</ul>

						<div className="mt-8 rounded-2xl border border-zinc-900/10 bg-zinc-950 p-4 text-xs text-zinc-100">
							<div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-zinc-400">
								<span>Service 3</span>
								<span>State: 2</span>
							</div>
							<p className="mt-3 font-mono text-[13px] text-zinc-200">
								providers = [1, 4, 6]
							</p>
							<p className="font-mono text-[13px] text-zinc-400">
								nextIndex = 3
							</p>
						</div>
					</div>
				</section>
			</main>

			<section className="mx-auto w-full max-w-6xl px-6 pb-16">
				<div className="grid gap-6 rounded-3xl border border-zinc-900/10 bg-white/80 p-6 sm:grid-cols-3">
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
							Reliability
						</p>
						<p className="mt-2 text-sm text-zinc-700">
							Serializable transactions keep allocation consistent under load.
						</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
							Fairness
						</p>
						<p className="mt-2 text-sm text-zinc-700">
							Round robin cursor is persisted per service, not per request.
						</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
							Realtime
						</p>
						<p className="mt-2 text-sm text-zinc-700">
							Dashboards stay live with SSE updates every few seconds.
						</p>
					</div>
				</div>
			</section>

			<footer className="mx-auto w-full max-w-6xl px-6 pb-12 text-xs text-zinc-600">
				<div className="flex flex-col items-start justify-between gap-4 border-t border-zinc-900/10 pt-6 sm:flex-row sm:items-center">
					<p>Lead Distribution System - evaluation build</p>
					<div className="flex flex-wrap gap-3 text-xs font-semibold text-zinc-700">
						<Link className="hover:text-zinc-900" href="/request-service">
							Request Service
						</Link>
						<Link className="hover:text-zinc-900" href="/dashboard">
							Dashboard
						</Link>
						<Link className="hover:text-zinc-900" href="/test-tools">
							Test Tools
						</Link>
						<a
							className="hover:text-zinc-900"
							href="https://github.com/guptadheerajj/lead-distribution-system"
							target="_blank"
							rel="noreferrer"
						>
							Source Code
						</a>
						<a
							className="hover:text-zinc-900"
							href="https://github.com/guptadheerajj"
							target="_blank"
							rel="noreferrer"
						>
							GitHub
						</a>
						<a
							className="hover:text-zinc-900"
							href="https://linkedin.com/in/guptadheerajj"
							target="_blank"
							rel="noreferrer"
						>
							LinkedIn
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
