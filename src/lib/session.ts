import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { env } from "./env";
import { SESSION_EXPIRY_DAYS } from "./constants";

const SESSION_COOKIE_NAME = "session";

export type SessionPayload = {
  email: string;
};

function getEncodedKey() {
  return new TextEncoder().encode(env.sessionSecret);
}

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRY_DAYS}d`)
    .sign(getEncodedKey());
}

export async function decryptSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getEncodedKey(), { algorithms: ["HS256"] });
    if (typeof payload.email !== "string") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax" as const,
    expires: expiresAt,
    path: "/",
  };
}

/**
 * Sets the session cookie with a fresh SESSION_EXPIRY_DAYS-day expiry (KTD2).
 * Called on successful OTP verification, and refreshed by the proxy on every
 * authenticated request to implement the sliding window (R3).
 */
export async function createSession(email: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const token = await encryptSession({ email });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(expiresAt));
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function readSessionCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return decryptSession(token);
}

/**
 * Data Access Layer entry point (per Next.js auth guide): the single place
 * that turns "is there a valid session" into "who is the caller", and the
 * only source of identity server-side code should trust (R23). Memoized per
 * request via React's cache() to avoid re-verifying the JWT on every call.
 */
export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await readSessionCookie();
  if (!session) {
    redirect("/login");
  }
  return session;
});

export { SESSION_COOKIE_NAME };
