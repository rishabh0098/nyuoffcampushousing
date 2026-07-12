import { NextResponse } from "next/server";

/**
 * Defense-in-depth CSRF check for cookie-authenticated state-changing
 * requests. Accepts same-origin browser fetches; rejects cross-site.
 * When neither Sec-Fetch-Site nor Origin is present (non-browser clients),
 * allows the request — SameSite=Lax cookies remain the primary CSRF control.
 */
export function isSameOriginMutation(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site === "same-origin") return true;
  if (site === "cross-site" || site === "same-site") return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

/** Returns a 403 response when the request fails the same-origin check. */
export function forbidCrossOrigin(request: Request): NextResponse | null {
  if (isSameOriginMutation(request)) return null;
  return NextResponse.json({ error: "Forbidden." }, { status: 403 });
}
