import { Suspense } from "react";
import { DashboardApp } from "@/components/dashboard-app";

export default function ListingsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-soft">Loading…</p>}>
      <DashboardApp />
    </Suspense>
  );
}
