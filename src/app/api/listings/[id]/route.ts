import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { OwnershipError, removeListing } from "@/lib/listings";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  const { id } = await params;

  try {
    await removeListing(id, session.email);
  } catch (error) {
    if (error instanceof OwnershipError) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
