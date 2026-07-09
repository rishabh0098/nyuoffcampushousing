"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  async function requestCode(e?: React.FormEvent) {
    e?.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setStep("otp");
      setCooldown(30);
      const interval = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } finally {
      setPending(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        return;
      }
      router.push("/listings");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-xl font-semibold">NYU Off-Campus Housing</h1>
        <p className="text-sm text-gray-500">
          Sign in with your @nyu.edu email. You&apos;ll stay signed in on this browser for a
          few days.
        </p>
      </div>

      {step === "email" && (
        <form onSubmit={requestCode} className="flex flex-col gap-3">
          <label className="text-sm font-medium" htmlFor="email">
            NYU email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="net-id@nyu.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send code"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyCode} className="flex flex-col gap-3">
          <p className="text-sm text-gray-600">
            Enter the 6-digit code sent to <strong>{email}</strong>.
          </p>
          <input
            id="code"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 tracking-widest"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
          >
            {pending ? "Verifying…" : "Verify"}
          </button>
          <button
            type="button"
            disabled={cooldown > 0 || pending}
            onClick={() => requestCode()}
            className="text-sm text-gray-600 underline disabled:opacity-50"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError(null);
              setCode("");
            }}
            className="text-sm text-gray-400 underline"
          >
            Use a different email
          </button>
        </form>
      )}
    </main>
  );
}
