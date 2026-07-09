import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/session";
import { CAMPUS_LABELS, GENDER_PREFERENCE_LABELS, LEASE_TYPE_LABELS } from "@/lib/constants";

// R6, R18 — full listing detail, including the poster's contact methods.
// Direct contact only: no in-app messaging is offered here.
export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;

  const listing = await prisma.listing.findFirst({
    where: { id, status: "Active" },
    include: { photos: true },
  });

  if (!listing) {
    notFound();
  }

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-xl font-semibold">{listing.title}</h1>
      <p className="text-lg">${(listing.rentCents / 100).toFixed(0)}/mo</p>

      {listing.photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {listing.photos.map((photo) => (
            <Image
              key={photo.id}
              src={photo.url}
              alt={listing.title}
              width={200}
              height={150}
              className="rounded object-cover"
            />
          ))}
        </div>
      )}

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-gray-500">Neighborhood</dt>
        <dd>{listing.neighborhood}</dd>
        <dt className="text-gray-500">Campus</dt>
        <dd>{CAMPUS_LABELS[listing.campus]}</dd>
        <dt className="text-gray-500">Bedrooms</dt>
        <dd>{listing.bedrooms}</dd>
        <dt className="text-gray-500">Move-in date</dt>
        <dd>{listing.moveInDate.toDateString()}</dd>
        <dt className="text-gray-500">Lease type</dt>
        <dd>{LEASE_TYPE_LABELS[listing.leaseType]}</dd>
        <dt className="text-gray-500">Guarantor required</dt>
        <dd>{listing.guarantorReq ? "Yes" : "No"}</dd>
        <dt className="text-gray-500">Utilities included</dt>
        <dd>{listing.utilitiesIncl ? "Yes" : "No"}</dd>
        <dt className="text-gray-500">Wifi included</dt>
        <dd>{listing.wifiIncl ? "Yes" : "No"}</dd>
        <dt className="text-gray-500">Vegetarian preferred</dt>
        <dd>{listing.vegPreferred ? "Yes" : "No"}</dd>
        <dt className="text-gray-500">Gender preference</dt>
        <dd>{GENDER_PREFERENCE_LABELS[listing.genderPref]}</dd>
      </dl>

      <p className="whitespace-pre-wrap text-sm">{listing.description}</p>

      <section className="rounded border border-gray-200 p-4">
        <h2 className="mb-2 font-medium">Contact the poster</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {listing.contactWhatsapp && <li>WhatsApp: {listing.contactWhatsapp}</li>}
          {listing.contactEmail && <li>Email: {listing.contactEmail}</li>}
          {listing.contactPhone && <li>Phone: {listing.contactPhone}</li>}
        </ul>
      </section>
    </article>
  );
}
