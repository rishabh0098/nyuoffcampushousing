import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { runListingLifecycleJob } from "@/lib/listing-lifecycle";

// KTD4, U5 — daily Vercel Cron job (see vercel.json). Authenticated via a
// shared secret rather than the user session, since it's called by Vercel's
// scheduler, not a browser.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runListingLifecycleJob();
  return NextResponse.json(result);
}
