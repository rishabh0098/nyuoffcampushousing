import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "./env";
import { NYU_GOOGLE_WORKSPACE_DOMAIN } from "./constants";

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = new Set(["https://accounts.google.com", "accounts.google.com"]);

export const OAUTH_STATE_COOKIE_NAME = "oauth_state";
const OAUTH_SCOPE = "openid email";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getGoogleJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));
  }
  return jwks;
}

/**
 * Builds Google's OAuth 2.0 authorization URL (KTD3). `hd` is sent as a UX
 * hint to Google's account chooser; identity is still enforced server-side in
 * assertNyuIdentity() via email domain + the ID token `hd` claim.
 */
export function buildGoogleAuthUrl({ redirectUri, state }: { redirectUri: string; state: string }): string {
  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: OAUTH_SCOPE,
    state,
    hd: NYU_GOOGLE_WORKSPACE_DOMAIN,
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

/** Exchanges an authorization code for an ID token via Google's token endpoint. */
export async function exchangeCodeForIdToken({
  code,
  redirectUri,
}: {
  code: string;
  redirectUri: string;
}): Promise<string> {
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed with status ${response.status}`);
  }

  const data = (await response.json()) as { id_token?: string };
  if (!data.id_token) {
    throw new Error("Google token response did not include an id_token");
  }
  return data.id_token;
}

export type GoogleIdTokenClaims = {
  email?: string;
  email_verified?: boolean;
  hd?: string;
};

/** Verifies the ID token's signature against Google's published JWKS and audience/issuer. */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdTokenClaims> {
  const { payload } = await jwtVerify(idToken, getGoogleJwks(), {
    audience: env.googleClientId,
  });

  if (typeof payload.iss !== "string" || !GOOGLE_ISSUERS.has(payload.iss)) {
    throw new Error("Unexpected Google ID token issuer");
  }

  return payload as GoogleIdTokenClaims;
}

export type NyuIdentityResult =
  | { ok: true; email: string }
  | { ok: false; reason: "missing_email" | "email_not_verified" | "wrong_domain" | "wrong_hd" };

/**
 * Pure decision function (R1, R2, R22): given verified Google ID token
 * claims, decides whether they represent a usable NYU identity. Kept free of
 * I/O so the domain/verification check — the security-critical piece — is
 * cheaply unit-testable without a live Google account or network call.
 */
export function assertNyuIdentity(claims: GoogleIdTokenClaims): NyuIdentityResult {
  const email = claims.email?.trim().toLowerCase();
  if (!email) {
    return { ok: false, reason: "missing_email" };
  }
  if (claims.email_verified !== true) {
    return { ok: false, reason: "email_not_verified" };
  }
  if (!email.endsWith(`@${NYU_GOOGLE_WORKSPACE_DOMAIN}`)) {
    return { ok: false, reason: "wrong_domain" };
  }
  // Hosted-domain claim must match NYU Workspace (not only the email suffix).
  if (claims.hd !== NYU_GOOGLE_WORKSPACE_DOMAIN) {
    return { ok: false, reason: "wrong_hd" };
  }
  return { ok: true, email };
}
