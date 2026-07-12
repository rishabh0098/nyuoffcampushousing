"use client";

import { useState } from "react";
import { useCompare } from "@/lib/compare-context";
import { MAX_COMPARE_LISTINGS } from "@/lib/constants";

/** "Compare" checkbox pill rendered on each Available-listings card. */
export function CompareToggle({ listingId }: { listingId: string }) {
  const { isSelected, toggle, atLimit } = useCompare();
  const [showLimitMessage, setShowLimitMessage] = useState(false);
  const selected = isSelected(listingId);

  function onChange() {
    if (!selected && atLimit) {
      setShowLimitMessage(true);
      setTimeout(() => setShowLimitMessage(false), 2500);
      return;
    }
    toggle(listingId);
  }

  return (
    <div className="relative">
      <label className="checkbox-pill" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={onChange} />
        Compare
      </label>
      {showLimitMessage && (
        <span className="absolute left-0 top-full z-10 mt-1 w-max rounded-md bg-ink px-2 py-1 text-xs text-surface shadow-sm">
          Remove one to add another (max {MAX_COMPARE_LISTINGS})
        </span>
      )}
    </div>
  );
}
