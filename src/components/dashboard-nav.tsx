"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboardShell, type DashTab } from "@/lib/dashboard-shell-context";

const TABS: { id: DashTab; href: string; label: string }[] = [
  { id: "listings", href: "/listings", label: "Available listings" },
  { id: "my-listings", href: "/my-listings", label: "My listings" },
  { id: "glossary", href: "/glossary", label: "Glossary" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const shell = useDashboardShell();

  return (
    <nav className="flex gap-1 text-sm font-medium">
      {TABS.map((tab) => {
        const active = shell?.clientTabMode
          ? shell.tab === tab.id
          : tab.id === "listings"
            ? pathname.startsWith("/listings")
            : pathname.startsWith(tab.href);

        if (shell?.clientTabMode) {
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => shell.setTab(tab.id)}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                active
                  ? "bg-accent-soft text-accent"
                  : "text-ink-soft hover:bg-accent-soft/60 hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        }

        return (
          <Link
            key={tab.id}
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
