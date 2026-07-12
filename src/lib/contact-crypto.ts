import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { env } from "./env";

const PREFIX = "enc:v1:";
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;
const KEY_BYTES = 32;

function getKey(): Buffer {
  const raw = env.contactEncryptionKey;
  const key = Buffer.from(raw, "base64");
  if (key.length !== KEY_BYTES) {
    throw new Error(
      `CONTACT_ENCRYPTION_KEY must decode to exactly ${KEY_BYTES} bytes (got ${key.length}). Generate with: openssl rand -base64 32`
    );
  }
  return key;
}

/**
 * Encrypt a contact field for at-rest storage (AES-256-GCM).
 * Empty / null inputs stay null.
 */
export function encryptContactField(plaintext: string | null | undefined): string | null {
  if (plaintext == null || plaintext === "") return null;

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return (
    PREFIX +
    [iv, ciphertext, tag].map((buf) => buf.toString("base64url")).join(":")
  );
}

/**
 * Decrypt a contact field. Values without the `enc:v1:` prefix are treated as
 * legacy plaintext (transparent migration until rows are rewritten on update).
 */
export function decryptContactField(stored: string | null | undefined): string | null {
  if (stored == null || stored === "") return null;
  if (!stored.startsWith(PREFIX)) return stored;

  const payload = stored.slice(PREFIX.length);
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted contact field format.");
  }

  const [ivB64, ciphertextB64, tagB64] = parts;
  const iv = Buffer.from(ivB64, "base64url");
  const ciphertext = Buffer.from(ciphertextB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");

  if (iv.length !== IV_BYTES || tag.length !== AUTH_TAG_BYTES) {
    throw new Error("Invalid encrypted contact field lengths.");
  }

  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}

export function encryptContactFields(fields: {
  contactWhatsapp?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}): {
  contactWhatsapp: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
} {
  return {
    contactWhatsapp: encryptContactField(fields.contactWhatsapp || null),
    contactEmail: encryptContactField(fields.contactEmail || null),
    contactPhone: encryptContactField(fields.contactPhone || null),
  };
}

export function decryptContactFields<
  T extends {
    contactWhatsapp?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  },
>(listing: T): T {
  return {
    ...listing,
    contactWhatsapp: decryptContactField(listing.contactWhatsapp),
    contactEmail: decryptContactField(listing.contactEmail),
    contactPhone: decryptContactField(listing.contactPhone),
  };
}
