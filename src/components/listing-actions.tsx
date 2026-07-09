"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "./confirm-modal";

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

  return (
    <>
      <button onClick={() => setConfirming(true)} className="btn btn-danger-outline px-3 py-1.5 text-xs">
        Remove
      </button>
      {confirming && (
        <ConfirmModal
          title="Remove this listing?"
          description="It will move to Inactive and disappear from Available listings. You can reactivate it later from My listings."
          confirmLabel="Remove"
          pendingLabel="Removing…"
          pending={pending}
          danger
          onConfirm={confirmRemove}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
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
