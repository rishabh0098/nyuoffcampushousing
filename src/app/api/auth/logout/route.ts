import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";
import { forbidCrossOrigin } from "@/lib/same-origin";

export async function POST(request: Request) {
  const forbidden = forbidCrossOrigin(request);
  if (forbidden) return forbidden;

  await deleteSession();
  return NextResponse.json({ ok: true });
}
