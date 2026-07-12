"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  buildDashboardHref,
  getFilterQueryString,
  parseDashTab,
  type DashTab,
} from "@/lib/dashboard-url";

const TABS: { id: DashTab; label: string }[] = [
  { id: "available", label: "Available listings" },
  { id: "mine", label: "My listings" },
  { id: "glossary", label: "Glossary" },
];

export function DashboardNav() {
  const searchParams = useSearchParams();
  const tab = parseDashTab(searchParams);
  const filterQuery = getFilterQueryString(searchParams);

  return (
    <nav className="flex gap-1 text-sm font-medium">
      {TABS.map((t) => {
        const active = tab === t.id;
        return (
          <Link
            key={t.id}
            href={buildDashboardHref({
              tab: t.id,
              filters: t.id === "available" ? filterQuery : undefined,
            })}
            prefetch={false}
            scroll={false}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              active
                ? "bg-accent-soft text-accent"
                : "text-ink-soft hover:bg-accent-soft/60 hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
