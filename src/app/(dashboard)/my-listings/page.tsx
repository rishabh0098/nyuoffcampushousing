import { verifySession } from "@/lib/session";
import { DashboardTabs } from "@/components/dashboard-tabs";

// R9 — My listings tab root. Panel data is fetched client-side with
// sessionStorage + rate-limited refresh.
export default async function MyListingsPage() {
  await verifySession();
  return <DashboardTabs />;
}
