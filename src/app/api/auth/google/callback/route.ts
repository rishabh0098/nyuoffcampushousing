import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  assertNyuIdentity,
  exchangeCodeForIdToken,
  verifyGoogleIdToken,
  OAUTH_STATE_COOKIE_NAME,
} from "@/lib/google-oauth";
import { createSession } from "@/lib/session";

const SIGNIN_FAILED_REDIRECT = "/login?error=google_signin_failed";
const WRONG_DOMAIN_REDIRECT = "/login?error=not_nyu_account";

/** R2, R3, R22 — handles Google's redirect back, verifies the NYU domain, and starts the session (KTD2, KTD3). */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(OAUTH_STATE_COOKIE_NAME)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE_NAME);

  if (oauthError || !code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL(SIGNIN_FAILED_REDIRECT, origin));
  }

  try {
    const redirectUri = new URL("/api/auth/google/callback", origin).toString();
    const idToken = await exchangeCodeForIdToken({ code, redirectUri });
    const claims = await verifyGoogleIdToken(idToken);
    const identity = assertNyuIdentity(claims);

    if (!identity.ok) {
      const redirectPath =
        identity.reason === "wrong_domain" ? WRONG_DOMAIN_REDIRECT : SIGNIN_FAILED_REDIRECT;
      return NextResponse.redirect(new URL(redirectPath, origin));
    }

    await createSession(identity.email);
    return NextResponse.redirect(new URL("/listings", origin));
  } catch {
    return NextResponse.redirect(new URL(SIGNIN_FAILED_REDIRECT, origin));
  }
}
