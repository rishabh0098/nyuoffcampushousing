"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

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
          <button onClick={onCancel} className="btn btn-ghost px-3 py-1.5 text-sm">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className={`px-3 py-1.5 text-sm ${danger ? "btn btn-danger" : "btn btn-primary"}`}
          >
            {pending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
