import { describe, expect, it } from "vitest";
import { generateOtpCode, hashOtpCode, isNyuEmail, verifyOtpAttempt } from "./otp";

describe("isNyuEmail", () => {
  it("accepts @nyu.edu addresses", () => {
    expect(isNyuEmail("student@nyu.edu")).toBe(true);
  });

  it("is case-insensitive on the domain", () => {
    expect(isNyuEmail("student@NYU.EDU")).toBe(true);
  });

  it("rejects non-NYU domains", () => {
    expect(isNyuEmail("student@gmail.com")).toBe(false);
  });

  it("rejects lookalike domains", () => {
    expect(isNyuEmail("student@nyu.edu.evil.com")).toBe(false);
  });

  it("rejects malformed input", () => {
    expect(isNyuEmail("not-an-email")).toBe(false);
    expect(isNyuEmail("")).toBe(false);
  });
});

describe("generateOtpCode", () => {
  it("generates a 6-digit numeric code", () => {
    const code = generateOtpCode();
    expect(code).toMatch(/^\d{6}$/);
  });
});

describe("hashOtpCode", () => {
  it("produces a deterministic hash for the same code", () => {
    expect(hashOtpCode("123456")).toBe(hashOtpCode("123456"));
  });

  it("produces different hashes for different codes", () => {
    expect(hashOtpCode("123456")).not.toBe(hashOtpCode("654321"));
  });
});

describe("verifyOtpAttempt", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const codeHash = hashOtpCode("123456");

  function record(overrides: Partial<Parameters<typeof verifyOtpAttempt>[0]["record"]> = {}) {
    return {
      codeHash,
      expiresAt: new Date(now.getTime() + 5 * 60 * 1000),
      attemptCount: 0,
      consumedAt: null,
      ...overrides,
    };
  }

  it("succeeds with the correct code within the expiry window", () => {
    const result = verifyOtpAttempt({ submittedCode: "123456", record: record(), now });
    expect(result.outcome).toBe("success");
  });

  it("rejects an incorrect code and reports it as an attempt", () => {
    const result = verifyOtpAttempt({ submittedCode: "000000", record: record(), now });
    expect(result.outcome).toBe("incorrect");
    expect(result.attemptsRemaining).toBe(4);
  });

  it("requires a new code once max attempts are exhausted", () => {
    const result = verifyOtpAttempt({
      submittedCode: "000000",
      record: record({ attemptCount: 5 }),
      now,
    });
    expect(result.outcome).toBe("max_attempts_exceeded");
  });

  it("rejects an expired code even if correct", () => {
    const result = verifyOtpAttempt({
      submittedCode: "123456",
      record: record({ expiresAt: new Date(now.getTime() - 1000) }),
      now,
    });
    expect(result.outcome).toBe("expired");
  });

  it("rejects a code that was already consumed", () => {
    const result = verifyOtpAttempt({
      submittedCode: "123456",
      record: record({ consumedAt: new Date(now.getTime() - 1000) }),
      now,
    });
    expect(result.outcome).toBe("already_used");
  });
});
