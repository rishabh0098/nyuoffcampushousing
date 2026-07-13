import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * In production, SESSION_SECRET must provide ≥32 bytes of entropy: either the
 * raw string is ≥32 characters, or a base64-decoded form yields ≥32 bytes.
 */
function assertStrongSessionSecret(secret: string): void {
  if (secret.length >= 32) return;

  try {
    const decoded = Buffer.from(secret, "base64");
    if (decoded.length >= 32) return;
  } catch {
    // fall through to the error below
  }

  throw new Error(
    "SESSION_SECRET must be at least 32 characters long (or ≥32 bytes when base64-decoded) in production."
  );
}

/**
 * Lazily-read environment accessors. Reading lazily (rather than at module
 * load) keeps this importable in test/build contexts where not every var is
 * set, while still failing loudly the moment a real request needs one.
 */
export const env = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get sessionSecret() {
    const value = required("SESSION_SECRET");
    if ((process.env.NODE_ENV ?? "development") === "production") {
      assertStrongSessionSecret(value);
    }
    return value;
  },
  get googleClientId() {
    return required("GOOGLE_CLIENT_ID");
  },
  get googleClientSecret() {
    return required("GOOGLE_CLIENT_SECRET");
  },
  get cronSecret() {
    return required("CRON_SECRET");
  },
  get nodeEnv() {
    return process.env.NODE_ENV ?? "development";
  },
};
