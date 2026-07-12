/**
 * Public listing payloads omit `posterEmail` so browse/search/compare
 * responses don't leak the poster's Google account identity.
 */
export function toPublicListing<T extends { posterEmail: string }>(
  listing: T
): Omit<T, "posterEmail"> {
  const { posterEmail, ...rest } = listing;
  void posterEmail;
  return rest;
}

export function toPublicListings<T extends { posterEmail: string }>(
  listings: T[]
): Array<Omit<T, "posterEmail">> {
  return listings.map(toPublicListing);
}
