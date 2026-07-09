"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const ERROR_MESSAGES: Record<string, string> = {
  not_nyu_account: "Please sign in with your NYU (@nyu.edu) Google account.",
  google_signin_failed: "Sign-in failed or was cancelled. Please try again.",
};

function LoginError() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  if (!errorCode) return null;
  const message = ERROR_MESSAGES[errorCode] ?? "Something went wrong. Please try again.";
  return (
    <p className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger">
      {message}
    </p>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-accent"
      />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div
        aria-hidden
        className="font-display pointer-events-none absolute -top-10 right-[-4rem] text-[16rem] leading-none text-accent-soft select-none sm:text-[22rem]"
      >
        NY
      </div>

      <div className="relative flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col gap-3 text-center">
          <span className="eyebrow">NYU Off-Campus Housing</span>
          <h1 className="font-display text-3xl text-ink">
            A shared listings board <br />for NYU students
          </h1>
          <p className="text-sm text-ink-soft">
            A small, unofficial tool built by a fellow student to help NYU folks post and find
            off-campus housing without digging through group chats. Sign in with your NYU Google
            account to browse, post, and manage listings — no passwords, no codes.
          </p>
        </div>

        <Suspense fallback={null}>
          <LoginError />
        </Suspense>

        <a
          href="/api/auth/google"
          className="flex items-center justify-center gap-3 rounded-lg border border-border bg-surface-raised px-4 py-3 text-sm font-medium text-ink shadow-sm transition-colors hover:border-accent hover:bg-accent-soft"
        >
          <GoogleLogo />
          Sign in with Google
        </a>
      </div>
    </main>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
