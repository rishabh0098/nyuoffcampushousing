"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { IconCheck, IconTrash, IconX } from "@/components/icons";

/**
 * Small centered confirmation modal, rendered via a portal so it always
 * overlays the full viewport regardless of where the trigger button sits
 * inside a constrained-width grid card.
 */
export function ConfirmModal({
  title,
  description,
  confirmLabel,
  pendingLabel,
  pending,
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  pending: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="tile w-full max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg text-ink">{title}</h2>
        <p className="mt-2 text-sm text-ink-soft">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-sm"
          >
            <IconX size={14} />
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm ${
              danger ? "btn btn-danger" : "btn btn-primary"
            }`}
          >
            {danger ? <IconTrash size={14} /> : <IconCheck size={14} />}
            {pending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
