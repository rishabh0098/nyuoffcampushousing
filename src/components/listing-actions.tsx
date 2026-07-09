"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EditListingButton({ listingId }: { listingId: string }) {
  return (
    <Link href={`/my-listings/${listingId}/edit`} className="btn btn-secondary px-3 py-1.5 text-xs">
      Edit
    </Link>
  );
}

export function RemoveListingButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirmRemove() {
    setPending(true);
    try {
      await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setPending(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      // w-full so this stacks below any sibling action button (e.g. Edit)
      // instead of squeezing onto the same line and forcing the card wider.
      <div className="flex w-full flex-col gap-2 text-sm text-ink-soft">
        <p>Remove this listing? It will move to Inactive.</p>
        <div className="flex gap-2">
          <button onClick={confirmRemove} disabled={pending} className="btn btn-danger px-3 py-1.5">
            {pending ? "Removing…" : "Confirm"}
          </button>
          <button onClick={() => setConfirming(false)} className="btn btn-ghost px-2 py-1.5">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="btn btn-danger-outline px-3 py-1.5 text-xs">
      Remove
    </button>
  );
}

export function ReactivateListingButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function reactivate() {
    setPending(true);
    try {
      await fetch(`/api/listings/${listingId}/reactivate`, { method: "POST" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button onClick={reactivate} disabled={pending} className="btn btn-success-outline px-3 py-1.5 text-xs">
      {pending ? "Reactivating…" : "Reactivate"}
    </button>
  );
}
