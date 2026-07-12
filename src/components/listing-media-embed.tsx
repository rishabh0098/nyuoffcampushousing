"use client";

import { resolveMediaEmbed } from "@/lib/listing-media-url";

/**
 * Embed cloud media when possible; always offer an external open link.
 * NYU-restricted Drive content only renders for viewers signed into Google
 * with an account that has access — the app cannot bypass Drive ACLs.
 */
export function ListingMediaEmbed({
  mediaLink,
  compact = false,
}: {
  mediaLink: string | null | undefined;
  compact?: boolean;
}) {
  if (!mediaLink) return null;

  const info = resolveMediaEmbed(mediaLink);
  if (!info) {
    return (
      <p className="text-sm text-ink-soft">Media link is unavailable or not allowlisted.</p>
    );
  }

  const openLabel =
    info.providerLabel === "Google Drive" ? "Open in Google Drive" : `Open in ${info.providerLabel}`;

  return (
    <section className={compact ? "flex flex-col gap-2" : "flex flex-col gap-3"}>
      {!compact && (
        <h2 className="font-display text-lg text-ink">Photos &amp; video</h2>
      )}
      {info.embedUrl ? (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <iframe
            title={`${info.providerLabel} media`}
            src={info.embedUrl}
            className={compact ? "h-40 w-full" : "h-64 w-full sm:h-80"}
            allow="autoplay"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : null}
      <a
        href={info.openUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-secondary inline-flex w-fit items-center text-sm"
      >
        {openLabel}
      </a>
      {!compact && info.providerLabel === "Google Drive" && (
        <p className="text-xs text-ink-soft">
          NYU-restricted Drive folders open in the embed only when you&apos;re signed into
          Google with an NYU account that has access. If the preview is blank, use the
          button above.
        </p>
      )}
    </section>
  );
}
