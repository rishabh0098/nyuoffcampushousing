import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { compressListingPhoto } from "./compress-listing-photo";
import { PHOTO_MAX_EDGE_PX } from "./constants";

describe("compressListingPhoto", () => {
  it("resizes a large image down to the max edge and returns webp", async () => {
    const input = await sharp({
      create: {
        width: 3200,
        height: 2400,
        channels: 3,
        background: { r: 40, g: 80, b: 120 },
      },
    })
      .jpeg()
      .toBuffer();

    const result = await compressListingPhoto(input);
    const meta = await sharp(result.buffer).metadata();

    expect(result.contentType).toBe("image/webp");
    expect(result.extension).toBe("webp");
    expect(meta.format).toBe("webp");
    expect(meta.width).toBeLessThanOrEqual(PHOTO_MAX_EDGE_PX);
    expect(meta.height).toBeLessThanOrEqual(PHOTO_MAX_EDGE_PX);
    expect(result.buffer.byteLength).toBeLessThan(input.byteLength);
  });

  it("does not enlarge a small image", async () => {
    const input = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 3,
        background: { r: 200, g: 100, b: 50 },
      },
    })
      .png()
      .toBuffer();

    const result = await compressListingPhoto(input);
    const meta = await sharp(result.buffer).metadata();

    expect(meta.width).toBe(400);
    expect(meta.height).toBe(300);
  });
});
