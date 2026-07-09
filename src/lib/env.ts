import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
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
    return required("SESSION_SECRET");
  },
  get googleClientId() {
    return required("GOOGLE_CLIENT_ID");
  },
  get googleClientSecret() {
    return required("GOOGLE_CLIENT_SECRET");
  },
  get blobReadWriteToken() {
    return required("BLOB_READ_WRITE_TOKEN");
  },
  get cronSecret() {
    return required("CRON_SECRET");
  },
  get nodeEnv() {
    return process.env.NODE_ENV ?? "development";
  },
};
