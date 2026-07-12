"use client";

import { useState } from "react";
import { useCompare } from "@/lib/compare-context";
import { CompareModal } from "@/components/compare-modal";

/** Floating bottom bar shown once at least one listing is selected for comparison. */
export function CompareBar() {
  const { selectedIds, clear } = useCompare();
  const [modalOpen, setModalOpen] = useState(false);

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <div className="tile flex items-center gap-3 px-4 py-2.5 shadow-lg">
          <span className="text-sm text-ink">
            {selectedIds.length} listing{selectedIds.length === 1 ? "" : "s"} selected
          </span>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary px-3 py-1.5 text-sm">
            Compare
          </button>
          <button onClick={clear} className="btn btn-ghost px-2 py-1.5 text-sm">
            Clear
          </button>
        </div>
      </div>
      {modalOpen && <CompareModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
