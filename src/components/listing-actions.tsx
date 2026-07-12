"use client";

import { useState } from "react";
import { ConfirmModal } from "./confirm-modal";
import { IconPencil, IconRotateCcw, IconTrash } from "./icons";

export function EditListingButton({ onEdit }: { onEdit: () => void }) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="btn btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
    >
      <IconPencil size={13} />
      Edit
    </button>
  );
}

export function RemoveListingButton({
  listingId,
  onMutated,
}: {
  listingId: string;
  onMutated?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirmRemove() {
    setPending(true);
    try {
      await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
      onMutated?.();
    } finally {
      setPending(false);
      setConfirming(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="btn btn-danger-outline inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
      >
        <IconTrash size={13} />
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

export function ReactivateListingButton({
  listingId,
  onMutated,
}: {
  listingId: string;
  onMutated?: () => void;
}) {
  const [pending, setPending] = useState(false);

  async function reactivate() {
    setPending(true);
    try {
      await fetch(`/api/listings/${listingId}/reactivate`, { method: "POST" });
      onMutated?.();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={reactivate}
      disabled={pending}
      className="btn btn-success-outline inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
    >
      <IconRotateCcw size={13} className={pending ? "animate-spin" : undefined} />
      {pending ? "Reactivating…" : "Reactivate"}
    </button>
  );
}
