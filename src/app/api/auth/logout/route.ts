import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";
import { forbidCrossOrigin } from "@/lib/same-origin";

/** Clears the session cookie. The same-origin check blocks cross-site logout. */
export async function POST(request: Request) {
  const forbidden = forbidCrossOrigin(request);
  if (forbidden) return forbidden;

  await deleteSession();
  return NextResponse.json({ ok: true });
}
