import { describe, expect, it } from "vitest";
import { assertNyuIdentity } from "./google-oauth";

describe("assertNyuIdentity", () => {
  it("accepts a verified nyu.edu email", () => {
    const result = assertNyuIdentity({ email: "student@nyu.edu", email_verified: true });
    expect(result).toEqual({ ok: true, email: "student@nyu.edu" });
  });

  it("normalizes email casing/whitespace", () => {
    const result = assertNyuIdentity({ email: "  Student@NYU.edu  ", email_verified: true });
    expect(result).toEqual({ ok: true, email: "student@nyu.edu" });
  });

  it("rejects a missing email", () => {
    const result = assertNyuIdentity({ email_verified: true });
    expect(result).toEqual({ ok: false, reason: "missing_email" });
  });

  it("rejects an unverified email even on the nyu.edu domain", () => {
    const result = assertNyuIdentity({ email: "student@nyu.edu", email_verified: false });
    expect(result).toEqual({ ok: false, reason: "email_not_verified" });
  });

  it("rejects a verified email outside the nyu.edu domain", () => {
    const result = assertNyuIdentity({ email: "student@gmail.com", email_verified: true });
    expect(result).toEqual({ ok: false, reason: "wrong_domain" });
  });

  it("rejects a domain that merely ends with nyu.edu as a substring but isn't a subdomain match", () => {
    const result = assertNyuIdentity({ email: "student@notnyu.edu", email_verified: true });
    expect(result).toEqual({ ok: false, reason: "wrong_domain" });
  });
});
