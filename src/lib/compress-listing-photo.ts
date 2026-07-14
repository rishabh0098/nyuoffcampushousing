import "server-only";
import sharp from "sharp";
import { PHOTO_MAX_EDGE_PX, PHOTO_WEBP_QUALITY } from "./constants";

export type CompressedListingPhoto = {
  buffer: Buffer;
  contentType: "image/webp";
  extension: "webp";
};

/**
 * Resize + re-encode listing photos before Blob upload so storage/transfer
 * stay within free-tier budgets. Honors EXIF orientation; never enlarges.
 */
export async function compressListingPhoto(
  input: Buffer
): Promise<CompressedListingPhoto> {
  const buffer = await sharp(input)
    .rotate()
    .resize({
      width: PHOTO_MAX_EDGE_PX,
      height: PHOTO_MAX_EDGE_PX,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: PHOTO_WEBP_QUALITY })
    .toBuffer();

  return { buffer, contentType: "image/webp", extension: "webp" };
}
