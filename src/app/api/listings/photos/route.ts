import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { verifySession } from "@/lib/session";
import { ALLOWED_PHOTO_MIME_TYPES, MAX_PHOTO_SIZE_BYTES } from "@/lib/constants";
import { compressListingPhoto } from "@/lib/compress-listing-photo";
import { forbidCrossOrigin } from "@/lib/same-origin";

const MAX_PHOTO_SIZE_MB = MAX_PHOTO_SIZE_BYTES / (1024 * 1024);

// KTD6 — photos via Vercel Blob, capped at 6/listing, 2MB each (pre-compress),
// jpg/png/webp. Server resizes to ≤1600px and stores WebP. One photo per
// request; the client calls this once per selected file before submitting
// the listing form with the resulting URLs.
export async function POST(request: Request) {
  const forbidden = forbidCrossOrigin(request);
  if (forbidden) return forbidden;

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
    return NextResponse.json(
      { error: `Photos must be ${MAX_PHOTO_SIZE_MB}MB or smaller.` },
      { status: 400 }
    );
  }

  let compressed;
  try {
    compressed = await compressListingPhoto(Buffer.from(await file.arrayBuffer()));
  } catch {
    return NextResponse.json({ error: "Could not process that image." }, { status: 400 });
  }

  const blob = await put(
    `listing-photos/${crypto.randomUUID()}.${compressed.extension}`,
    compressed.buffer,
    {
      access: "public",
      contentType: compressed.contentType,
    }
  );

  return NextResponse.json({ url: blob.url });
}
