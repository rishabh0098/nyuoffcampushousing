import { decryptContactFields } from "./contact-crypto";

/**
 * Public listing payloads omit `posterEmail` so browse/search/compare
 * responses don't leak the poster's Google account identity. Contact fields
 * are decrypted for authenticated API responses.
 */
export function toPublicListing<
  T extends {
    posterEmail: string;
    contactWhatsapp?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  },
>(listing: T): Omit<T, "posterEmail"> {
  const decrypted = decryptContactFields(listing);
  const { posterEmail, ...rest } = decrypted;
  void posterEmail;
  return rest;
}

export function toPublicListings<
  T extends {
    posterEmail: string;
    contactWhatsapp?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  },
>(listings: T[]): Array<Omit<T, "posterEmail">> {
  return listings.map(toPublicListing);
}

/** Decrypt contacts while keeping posterEmail (owner detail responses). */
export function toOwnerListing<
  T extends {
    contactWhatsapp?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  },
>(listing: T): T {
  return decryptContactFields(listing);
}
