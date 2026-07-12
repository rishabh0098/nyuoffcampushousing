"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { MAX_COMPARE_LISTINGS } from "@/lib/constants";

const STORAGE_KEY = "compareListingIds";

type CompareContextValue = {
  selectedIds: string[];
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  atLimit: boolean;
};

const CompareContext = createContext<CompareContextValue | null>(null);

function readStoredIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Backs the "compare up to 3 listings" feature (side-by-side modal).
 * Selection lives in sessionStorage — persists across reloads/navigation
 * within the tab, cleared when the tab closes, and never touches the
 * server (it's just a set of listing ids, re-fetched fresh when the
 * comparison modal opens).
 */
export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Skip writing to sessionStorage until we've restored from it once —
  // otherwise the initial `[]` state (and React Strict Mode remounts)
  // would wipe whatever the user previously selected.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Deliberate mount-detection read of sessionStorage — there's no
    // external store to subscribe to here, just a one-time read once we're
    // on the client (sessionStorage isn't available during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIds(readStoredIds());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds, hydrated]);

  const value: CompareContextValue = {
    selectedIds,
    isSelected: (id) => selectedIds.includes(id),
    toggle: (id) => {
      setSelectedIds((current) => {
        if (current.includes(id)) return current.filter((existing) => existing !== id);
        if (current.length >= MAX_COMPARE_LISTINGS) return current;
        return [...current, id];
      });
    },
    remove: (id) => setSelectedIds((current) => current.filter((existing) => existing !== id)),
    clear: () => setSelectedIds([]),
    atLimit: selectedIds.length >= MAX_COMPARE_LISTINGS,
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within a CompareProvider");
  return ctx;
}
