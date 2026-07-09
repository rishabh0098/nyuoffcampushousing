import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { createListing, ListingInputSchema } from "@/lib/listings";

export async function POST(request: Request) {
  const session = await verifySession();
  const body = await request.json().catch(() => null);

  const parsed = ListingInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid listing data.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const listing = await createListing(session.email, parsed.data);
  return NextResponse.json({ listing }, { status: 201 });
}
