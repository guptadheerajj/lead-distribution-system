import Link from "next/link";

type SiteHeaderProps = {
	title: string;
	showBadges?: boolean;
};

type IconName = "home" | "form" | "dashboard" | "tools" | "code" | "external";

type NavItem = {
	label: string;
	href: string;
	icon: IconName;
	external?: boolean;
};

const navItems: NavItem[] = [
	{ label: "Home", href: "/", icon: "home" },
	{ label: "Request Service", href: "/request-service", icon: "form" },
	{ label: "Dashboard", href: "/dashboard", icon: "dashboard" },
	{ label: "Test Tools", href: "/test-tools", icon: "tools" },
	{
		label: "Source Code",
		href: "https://github.com/guptadheerajj/lead-distribution-system",
		icon: "code",
		external: true,
	},
	{
		label: "GitHub",
		href: "https://github.com/guptadheerajj",
		icon: "external",
		external: true,
	},
	{
		label: "LinkedIn",
		href: "https://linkedin.com/in/guptadheerajj",
		icon: "external",
		external: true,
	},
];

const Icon = ({ name }: { name: IconName }) => {
	switch (name) {
		case "home":
			return (
				<path d="M4 11l8-6 8 6v8a2 2 0 0 1-2 2h-4v-6H10v6H6a2 2 0 0 1-2-2z" />
			);
		case "form":
			return (
				<>
					<path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
					<path d="M8 11h8" />
					<path d="M8 15h6" />
				</>
			);
		case "dashboard":
			return (
				<>
					<path d="M4 4h7v7H4z" />
					<path d="M13 4h7v7h-7z" />
					<path d="M4 13h7v7H4z" />
					<path d="M13 13h7v7h-7z" />
				</>
			);
		case "tools":
			return <path d="M13 2L3 14h7l-1 8 10-12h-7z" />;
		case "code":
			return (
				<>
					<path d="M9 18l-6-6 6-6" />
					<path d="M15 6l6 6-6 6" />
				</>
			);
		case "external":
			return (
				<>
					<path d="M14 3h7v7" />
					<path d="M21 3l-9 9" />
					<path d="M10 7H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
				</>
			);
		default:
			return null;
	}
};

const NavLink = ({ item }: { item: NavItem }) => {
	const content = (
		<span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition hover:bg-white/90">
			<svg
				className="h-3.5 w-3.5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={1.6}
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<Icon name={item.icon} />
			</svg>
			{item.label}
		</span>
	);

	if (item.external) {
		return (
			<a
				key={item.label}
				href={item.href}
				target="_blank"
				rel="noreferrer"
				className="text-zinc-700 hover:text-zinc-900"
			>
				{content}
			</a>
		);
	}

	return (
		<Link
			key={item.label}
			href={item.href}
			className="text-zinc-700 hover:text-zinc-900"
		>
			{content}
		</Link>
	);
};

export default function SiteHeader({ title, showBadges }: SiteHeaderProps) {
	return (
		<header className="mx-auto w-full max-w-6xl px-6 pt-10">
			<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-semibold text-white">
						LD
					</div>
					<div>
						<p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
							Prowider
						</p>
						<p className="text-lg font-semibold">{title}</p>
					</div>
				</div>

				<div className="flex flex-col items-start gap-3 sm:items-end">
					{showBadges ? (
						<div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-600">
							<span className="rounded-full border border-zinc-900/10 bg-white/80 px-3 py-1">
								Prisma + Postgres
							</span>
							<span className="rounded-full border border-zinc-900/10 bg-white/80 px-3 py-1">
								Realtime ready
							</span>
						</div>
					) : null}
					<nav className="flex flex-wrap items-center gap-2 rounded-3xl border border-zinc-900/10 bg-white/80 px-2 py-2 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur">
						{navItems.map((item) => (
							<NavLink key={item.label} item={item} />
						))}
					</nav>
				</div>
			</div>
		</header>
	);
}
