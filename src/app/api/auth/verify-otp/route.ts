import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth";

const ERROR_MESSAGES: Record<string, string> = {
  not_found: "No active code found for this email. Please request a new one.",
  incorrect: "That code is incorrect. Please try again.",
  expired: "That code has expired. Please request a new one.",
  already_used: "That code has already been used. Please request a new one.",
  max_attempts_exceeded: "Too many incorrect attempts. Please request a new code.",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const code = typeof body?.code === "string" ? body.code : "";

  if (!email || !code) {
    return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
  }

  const result = await verifyOtp(email, code);

  if (!result.ok) {
    return NextResponse.json(
      { error: ERROR_MESSAGES[result.reason] ?? "Verification failed.", reason: result.reason },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
