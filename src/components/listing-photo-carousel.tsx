"use client";

import { useState } from "react";
import Image from "next/image";
import type { ListingPhoto } from "@prisma/client";

/**
 * Single-photo-at-a-time carousel for listing cards. Arrow buttons only
 * appear on hover (like typical showcase sites) and stop propagation so
 * clicking them doesn't trigger the card's wrapping <Link> navigation.
 */
export function ListingPhotoCarousel({
  photos,
}: {
  photos: Pick<ListingPhoto, "id" | "url">[];
}) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) return null;

  const goTo = (next: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIndex((next + photos.length) % photos.length);
  };

  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-surface">
      <Image
        src={photos[index].url}
        alt=""
        fill
        sizes="(min-width: 1024px) 320px, 50vw"
        className="object-cover"
      />

      {photos.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => goTo(index - 1, e)}
            className="absolute left-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => goTo(index + 1, e)}
            className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            ›
          </button>
          <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
            {photos.map((photo, i) => (
              <span
                key={photo.id}
                className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
