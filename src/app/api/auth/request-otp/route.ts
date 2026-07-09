import { NextResponse } from "next/server";
import { requestOtp } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const result = await requestOtp(email);

  if (!result.ok) {
    switch (result.reason) {
      case "invalid_email":
        return NextResponse.json(
          { error: "Please use your @nyu.edu email address." },
          { status: 400 }
        );
      case "cooldown":
        return NextResponse.json(
          {
            error: `Please wait ${result.retryAfterSeconds}s before requesting another code.`,
          },
          { status: 429 }
        );
      case "rate_limited":
        return NextResponse.json(
          { error: "Too many code requests. Please try again in an hour." },
          { status: 429 }
        );
    }
  }

  return NextResponse.json({ ok: true });
}
