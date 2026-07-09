import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession, SESSION_COOKIE_NAME } from "./lib/session";
import { SESSION_EXPIRY_DAYS } from "./lib/constants";

// Next.js 16 renamed Middleware to Proxy; functionality is unchanged. This
// performs the optimistic session check the framework recommends — real
// authorization still happens server-side in the DAL (src/lib/session.ts).
const PUBLIC_PAGE_PATHS = new Set(["/login"]);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The cron job authenticates via CRON_SECRET (checked in the route itself),
  // and the auth API routes are how a session gets created/destroyed in the
  // first place — neither should be gated behind an existing session.
  if (pathname.startsWith("/api/cron") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await decryptSession(token);
  const isPublicPath = PUBLIC_PAGE_PATHS.has(pathname);
  const isApiPath = pathname.startsWith("/api");

  if (!session && !isPublicPath) {
    if (isApiPath) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isPublicPath) {
    return NextResponse.redirect(new URL("/listings", request.url));
  }

  const response = NextResponse.next();

  // Sliding expiry (KTD2/R3): every authenticated request resets the
  // cookie's Max-Age, so an active user is never re-prompted for OTP.
  if (session && token) {
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
