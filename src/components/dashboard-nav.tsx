"use client";

import { useDashboardNav } from "@/lib/dashboard-nav-context";
import type { DashTab } from "@/lib/dashboard-url";

const TABS: { id: DashTab; label: string }[] = [
  { id: "available", label: "Available listings" },
  { id: "mine", label: "My listings" },
  { id: "glossary", label: "Glossary" },
];

export function DashboardNav() {
  const { tab, setTab } = useDashboardNav();

  return (
    <nav className="flex gap-1 text-sm font-medium">
      {TABS.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              active
                ? "bg-accent-soft text-accent"
                : "text-ink-soft hover:bg-accent-soft/60 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
