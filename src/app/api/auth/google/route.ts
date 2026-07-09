import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildGoogleAuthUrl, OAUTH_STATE_COOKIE_NAME } from "@/lib/google-oauth";

/** R1 — kicks off Google's OAuth Authorization Code flow (KTD3). */
export async function GET(request: NextRequest) {
  const state = randomBytes(16).toString("hex");
  const redirectUri = new URL("/api/auth/google/callback", request.nextUrl.origin).toString();

  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(buildGoogleAuthUrl({ redirectUri, state }));
}
