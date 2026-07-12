import { beforeAll, describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";

// Set key before importing modules that read env.
beforeAll(() => {
  process.env.CONTACT_ENCRYPTION_KEY = randomBytes(32).toString("base64");
});

describe("contact-crypto", () => {
  it("round-trips plaintext through AES-GCM", async () => {
    const { encryptContactField, decryptContactField } = await import("./contact-crypto");
    const encrypted = encryptContactField("hello@nyu.edu");
    expect(encrypted).toMatch(/^enc:v1:/);
    expect(encrypted).not.toContain("hello@nyu.edu");
    expect(decryptContactField(encrypted)).toBe("hello@nyu.edu");
  });

  it("returns null for empty values", async () => {
    const { encryptContactField, decryptContactField } = await import("./contact-crypto");
    expect(encryptContactField("")).toBeNull();
    expect(encryptContactField(null)).toBeNull();
    expect(decryptContactField(null)).toBeNull();
    expect(decryptContactField("")).toBeNull();
  });

  it("passes through legacy plaintext without the enc prefix", async () => {
    const { decryptContactField } = await import("./contact-crypto");
    expect(decryptContactField("+1-555-0100")).toBe("+1-555-0100");
  });

  it("encrypts all contact fields together", async () => {
    const { encryptContactFields, decryptContactFields } = await import("./contact-crypto");
    const encrypted = encryptContactFields({
      contactWhatsapp: "wa",
      contactEmail: "a@nyu.edu",
      contactPhone: "",
    });
    expect(encrypted.contactWhatsapp?.startsWith("enc:v1:")).toBe(true);
    expect(encrypted.contactEmail?.startsWith("enc:v1:")).toBe(true);
    expect(encrypted.contactPhone).toBeNull();

    const decrypted = decryptContactFields(encrypted);
    expect(decrypted.contactWhatsapp).toBe("wa");
    expect(decrypted.contactEmail).toBe("a@nyu.edu");
    expect(decrypted.contactPhone).toBeNull();
  });
});
