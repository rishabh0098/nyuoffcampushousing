import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { verifySession } from "@/lib/session";
import { ALLOWED_PHOTO_MIME_TYPES, MAX_PHOTO_SIZE_BYTES } from "@/lib/constants";

// KTD6 — photos via Vercel Blob, capped at 6/listing, 5MB each, jpg/png/webp.
// One photo per request; the client calls this once per selected file before
// submitting the listing form with the resulting URLs.
export async function POST(request: Request) {
  await verifySession();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, or WEBP images are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return NextResponse.json({ error: "Photos must be 5MB or smaller." }, { status: 400 });
  }

  const blob = await put(`listing-photos/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
