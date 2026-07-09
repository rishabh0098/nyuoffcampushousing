import Link from "next/link";
import { verifySession } from "@/lib/session";
import { SignOutButton } from "@/components/sign-out-button";

// R4 — three-tab dashboard shell shared by Available listings, My listings,
// and Glossary. Per the Next.js auth guide, layouts don't re-render on
// client-side navigation, so this only reads the session for display (the
// email in the header) — the actual auth check happens per-page/route via
// the DAL (verifySession) and in proxy.ts.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <nav className="flex gap-4 text-sm font-medium">
          <Link href="/listings">Available listings</Link>
          <Link href="/my-listings">My listings</Link>
          <Link href="/glossary">Glossary</Link>
        </nav>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{session.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
