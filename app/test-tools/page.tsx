import Link from "next/link";
import SiteHeader from "../components/SiteHeader";

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

			<SiteHeader title="Test Tools" />

			<main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
				<TestToolsPanel />
			</main>

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
