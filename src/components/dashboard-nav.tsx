"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/listings", label: "Available listings" },
  { href: "/my-listings", label: "My listings" },
  { href: "/glossary", label: "Glossary" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 text-sm font-medium">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              active
                ? "bg-accent-soft text-accent"
                : "text-ink-soft hover:bg-accent-soft/60 hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
