import { verifySession } from "@/lib/session";
import { DashboardTabs } from "@/components/dashboard-tabs";

// R5–R8, R24 — Available listings tab root. Data loads client-side (cached)
// so tab switches among dashboard roots do not re-query Neon via RSC.
export default async function ListingsPage() {
  await verifySession();
  return <DashboardTabs />;
}
