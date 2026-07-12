"use client";

import Link from "next/link";
import { useDashboardNav } from "@/lib/dashboard-nav-context";

export function DashboardBrand() {
  const { resetToHome } = useDashboardNav();

  return (
    <Link
      href="/listings"
      prefetch={false}
      onClick={(e) => {
        e.preventDefault();
        resetToHome();
      }}
      className="font-display text-lg text-ink"
    >
      NYU Off-Campus Housing
    </Link>
  );
}
