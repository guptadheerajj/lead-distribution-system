import Link from "next/link";

import TestToolsPanel from "./TestToolsPanel";

export const dynamic = "force-dynamic";

export default function TestToolsPage() {
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

			<header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-10">
				<div className="flex items-center gap-3">
					<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-semibold text-white">
						LD
					</div>
					<div>
						<p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
							Prowider
						</p>
						<p className="text-lg font-semibold">Test Tools</p>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-zinc-700">
					<Link className="hover:text-zinc-900" href="/request-service">
						Request Service
					</Link>
					<Link className="hover:text-zinc-900" href="/dashboard">
						Dashboard
					</Link>
				</div>
			</header>

			<main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
				<TestToolsPanel />
			</main>
		</div>
	);
}
