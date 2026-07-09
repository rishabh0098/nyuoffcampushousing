"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
      <span className="flex items-center gap-2 text-sm">
        Remove this listing? It will move to Inactive.
        <button
          onClick={confirmRemove}
          disabled={pending}
          className="rounded bg-red-600 px-2 py-1 text-white disabled:opacity-50"
        >
          {pending ? "Removing…" : "Confirm"}
        </button>
        <button onClick={() => setConfirming(false)} className="underline">
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-sm text-red-600 underline">
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
    <button onClick={reactivate} disabled={pending} className="text-sm text-green-700 underline">
      {pending ? "Reactivating…" : "Reactivate"}
    </button>
  );
}
