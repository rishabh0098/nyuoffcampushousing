import Link from "next/link";
import { verifySession } from "@/lib/session";
import { SignOutButton } from "@/components/sign-out-button";
import { DashboardNav } from "@/components/dashboard-nav";
import { ThemeToggle } from "@/components/theme-toggle";

// R4 — three-tab dashboard shell shared by Available listings, My listings,
// and Glossary. Per the Next.js auth guide, layouts don't re-render on
// client-side navigation, so this only reads the session for display (the
// email in the header) — the actual auth check happens per-page/route via
// the DAL (verifySession) and in proxy.ts.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/95 px-5 py-3 backdrop-blur-sm sm:px-8">
        <Link href="/listings" className="font-display text-lg text-ink">
          NYU Off-Campus Housing
        </Link>
        <DashboardNav />
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <span className="hidden sm:inline">{session.email}</span>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
