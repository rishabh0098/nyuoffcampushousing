import Link from "next/link";
import { Suspense } from "react";
import { verifySession } from "@/lib/session";
import { SignOutButton } from "@/components/sign-out-button";
import { DashboardNav } from "@/components/dashboard-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { DashboardChrome } from "@/lib/dashboard-shell-context";

// R4 — three-tab dashboard shell shared by Available listings, My listings,
// and Glossary. Tab switches among the three roots stay client-side (see
// DashboardChrome) to avoid repeat RSC/Neon hits; detail/edit routes still
// use normal navigation.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  return (
    <Suspense fallback={null}>
      <DashboardChrome>
        <div className="flex flex-1 flex-col">
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
      </DashboardChrome>
    </Suspense>
  );
}
