import { verifySession } from "@/lib/session";
import { DashboardTabs } from "@/components/dashboard-tabs";

export default async function GlossaryPage() {
  await verifySession();
  return <DashboardTabs />;
}
