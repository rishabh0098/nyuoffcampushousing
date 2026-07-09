import { notFound } from "next/navigation";
import { verifySession } from "@/lib/session";
import { getEditableListing, OwnershipError } from "@/lib/listings";
import { ListingForm, type ListingFormInitialValues } from "@/components/listing-form";

function toDateInputValue(date: Date | null): string | undefined {
  if (!date) return undefined;
  return date.toISOString().slice(0, 10);
}

// Editing is scoped to the caller's own Active listings (R9/R23) — an
// Inactive listing must be reactivated first, which resets its expiry clock
// anyway, so editing it in place wouldn't make sense.
export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  const { id } = await params;

  let listing;
  try {
    listing = await getEditableListing(id, session.email);
  } catch (error) {
    if (error instanceof OwnershipError) {
      notFound();
    }
    throw error;
  }

  const initialValues: ListingFormInitialValues = {
    title: listing.title,
    description: listing.description,
    rentCents: listing.rentCents,
    neighborhood: listing.neighborhood,
    campus: listing.campus,
    distanceFromCampusMiles: listing.distanceFromCampusMiles,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    furnishedStatus: listing.furnishedStatus,
    moveInDate: toDateInputValue(listing.moveInDate) ?? "",
    leaseEndDate: toDateInputValue(listing.leaseEndDate),
    leaseType: listing.leaseType,
    guarantorReq: listing.guarantorReq,
    utilitiesIncl: listing.utilitiesIncl,
    wifiIncl: listing.wifiIncl,
    acIncl: listing.acIncl,
    privateBathroom: listing.privateBathroom,
    vegPreferred: listing.vegPreferred,
    genderPref: listing.genderPref,
    contactWhatsapp: listing.contactWhatsapp ?? "",
    contactEmail: listing.contactEmail ?? "",
    contactPhone: listing.contactPhone ?? "",
    existingPhotoUrls: listing.photos.map((p) => p.url),
  };

  return <ListingForm mode="edit" listingId={listing.id} initialValues={initialValues} />;
}
