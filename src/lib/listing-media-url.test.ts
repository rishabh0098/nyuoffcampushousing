import { describe, expect, it } from "vitest";
import { isAllowedListingMediaUrl, resolveMediaEmbed } from "./listing-media-url";

describe("isAllowedListingMediaUrl", () => {
  it("allows HTTPS Google Drive folder links", () => {
    expect(
      isAllowedListingMediaUrl("https://drive.google.com/drive/folders/abc123")
    ).toBe(true);
  });

  it("rejects HTTP", () => {
    expect(isAllowedListingMediaUrl("http://drive.google.com/drive/folders/abc123")).toBe(
      false
    );
  });

  it("rejects unknown hosts", () => {
    expect(isAllowedListingMediaUrl("https://evil.example.com/folder")).toBe(false);
  });

  it("allows Dropbox and Box", () => {
    expect(isAllowedListingMediaUrl("https://www.dropbox.com/sh/abc/xyz")).toBe(true);
    expect(isAllowedListingMediaUrl("https://app.box.com/s/abc")).toBe(true);
  });

  it("rejects invalid URLs", () => {
    expect(isAllowedListingMediaUrl("not-a-url")).toBe(false);
  });
});

describe("resolveMediaEmbed", () => {
  it("maps Drive file links to /preview", () => {
    const info = resolveMediaEmbed(
      "https://drive.google.com/file/d/FILEID/view?usp=sharing"
    );
    expect(info?.embedUrl).toBe("https://drive.google.com/file/d/FILEID/preview");
    expect(info?.providerLabel).toBe("Google Drive");
  });

  it("maps Drive folder links to NYU embeddedfolderview", () => {
    const info = resolveMediaEmbed(
      "https://drive.google.com/drive/folders/FOLDERID?usp=sharing"
    );
    expect(info?.embedUrl).toContain("drive.google.com/a/nyu.edu/embeddedfolderview");
    expect(info?.embedUrl).toContain("id=FOLDERID");
    expect(info?.embedUrl).toContain("#grid");
  });

  it("falls back to open-only for Dropbox", () => {
    const info = resolveMediaEmbed("https://www.dropbox.com/sh/abc/xyz");
    expect(info?.embedUrl).toBeNull();
    expect(info?.openUrl).toContain("dropbox.com");
  });

  it("returns null for disallowed hosts", () => {
    expect(resolveMediaEmbed("https://evil.example.com/x")).toBeNull();
  });
});
