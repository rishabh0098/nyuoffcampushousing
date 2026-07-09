import "server-only";
import { prisma } from "./db";
import { createSession } from "./session";
import { sendOtpEmail } from "./resend";
import {
  generateOtpCode,
  hashOtpCode,
  isNyuEmail,
  verifyOtpAttempt,
  type OtpVerifyOutcome,
} from "./otp";
import {
  OTP_EXPIRY_MINUTES,
  OTP_MAX_REQUESTS_PER_HOUR,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "./constants";

export type RequestOtpResult =
  | { ok: true }
  | { ok: false; reason: "invalid_email" | "cooldown" | "rate_limited"; retryAfterSeconds?: number };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** R1, R2, R22 — request a fresh OTP, subject to cooldown + hourly rate limit (KTD3). */
export async function requestOtp(rawEmail: string): Promise<RequestOtpResult> {
  const email = normalizeEmail(rawEmail);
  if (!isNyuEmail(email)) {
    return { ok: false, reason: "invalid_email" };
  }

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [mostRecent, requestsInLastHour] = await Promise.all([
    prisma.otpCode.findFirst({ where: { email }, orderBy: { createdAt: "desc" } }),
    prisma.otpCode.count({ where: { email, createdAt: { gte: oneHourAgo } } }),
  ]);

  if (mostRecent) {
    const secondsSinceLast = (now.getTime() - mostRecent.createdAt.getTime()) / 1000;
    if (secondsSinceLast < OTP_RESEND_COOLDOWN_SECONDS) {
      return {
        ok: false,
        reason: "cooldown",
        retryAfterSeconds: Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLast),
      };
    }
  }

  if (requestsInLastHour >= OTP_MAX_REQUESTS_PER_HOUR) {
    return { ok: false, reason: "rate_limited" };
  }

  const code = generateOtpCode();
  await prisma.otpCode.create({
    data: {
      email,
      codeHash: hashOtpCode(code),
      expiresAt: new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  });

  await sendOtpEmail(email, code);
  return { ok: true };
}

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; reason: OtpVerifyOutcome | "not_found" };

/** R3, R22 — verify a submitted code and, on success, start the session (KTD2). */
export async function verifyOtp(rawEmail: string, submittedCode: string): Promise<VerifyOtpResult> {
  const email = normalizeEmail(rawEmail);
  const now = new Date();

  const record = await prisma.otpCode.findFirst({
    where: { email, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { ok: false, reason: "not_found" };
  }

  const result = verifyOtpAttempt({
    submittedCode,
    record: {
      codeHash: record.codeHash,
      expiresAt: record.expiresAt,
      attemptCount: record.attemptCount,
      consumedAt: record.consumedAt,
    },
    now,
  });

  if (result.outcome === "success") {
    await prisma.otpCode.update({ where: { id: record.id }, data: { consumedAt: now } });
    await createSession(email);
    return { ok: true };
  }

  if (result.outcome === "incorrect") {
    await prisma.otpCode.update({
      where: { id: record.id },
      data: { attemptCount: { increment: 1 } },
    });
  }

  return { ok: false, reason: result.outcome };
}
