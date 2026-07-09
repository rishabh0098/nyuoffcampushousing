import { createHash, randomInt } from "node:crypto";
import { OTP_CODE_LENGTH, OTP_MAX_VERIFY_ATTEMPTS } from "./constants";

const NYU_EMAIL_PATTERN = /^[^\s@]+@nyu\.edu$/i;

/** R1/R2 — only @nyu.edu addresses may authenticate. */
export function isNyuEmail(email: string): boolean {
  return NYU_EMAIL_PATTERN.test(email.trim());
}

export function generateOtpCode(): string {
  const max = 10 ** OTP_CODE_LENGTH;
  const value = randomInt(0, max);
  return value.toString().padStart(OTP_CODE_LENGTH, "0");
}

/** Codes are never stored in plaintext — only a SHA-256 hash. */
export function hashOtpCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export type OtpRecord = {
  codeHash: string;
  expiresAt: Date;
  attemptCount: number;
  consumedAt: Date | null;
};

export type OtpVerifyOutcome =
  | "success"
  | "incorrect"
  | "expired"
  | "already_used"
  | "max_attempts_exceeded";

export type OtpVerifyResult = {
  outcome: OtpVerifyOutcome;
  attemptsRemaining: number;
};

/**
 * Pure decision function for one OTP verification attempt (R22). Kept free of
 * I/O so the attempt-limit/expiry logic — the easiest part to get subtly
 * wrong — can be unit tested without a database.
 */
export function verifyOtpAttempt({
  submittedCode,
  record,
  now,
}: {
  submittedCode: string;
  record: OtpRecord;
  now: Date;
}): OtpVerifyResult {
  const attemptsRemaining = Math.max(OTP_MAX_VERIFY_ATTEMPTS - record.attemptCount, 0);

  if (record.consumedAt) {
    return { outcome: "already_used", attemptsRemaining };
  }
  if (record.attemptCount >= OTP_MAX_VERIFY_ATTEMPTS) {
    return { outcome: "max_attempts_exceeded", attemptsRemaining: 0 };
  }
  if (now.getTime() > record.expiresAt.getTime()) {
    return { outcome: "expired", attemptsRemaining };
  }
  if (hashOtpCode(submittedCode) !== record.codeHash) {
    return { outcome: "incorrect", attemptsRemaining: attemptsRemaining - 1 };
  }
  return { outcome: "success", attemptsRemaining };
}
