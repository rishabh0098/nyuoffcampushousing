"use client";

import { useCallback, useEffect, useState } from "react";
import type { Listing } from "@prisma/client";
import { ListingCard } from "@/components/listing-card";
import { ListingFilterForm } from "@/components/listing-filter-form";
import { CompareToggle } from "@/components/compare-toggle";
import { CompareProvider } from "@/lib/compare-context";
import { CompareBar } from "@/components/compare-bar";
import {
  EditListingButton,
  ReactivateListingButton,
  RemoveListingButton,
} from "@/components/listing-actions";
import { ListingDetailModal } from "@/components/listing-detail-modal";
import { ListingFormModal } from "@/components/listing-form-modal";
import { getGlossaryEntries } from "@/lib/glossary";
import { useDashboardNav } from "@/lib/dashboard-nav-context";
import {
  clearCachedBucket,
  formatRetrySeconds,
  getFetchGate,
  markFetched,
  readCachedJson,
  writeCachedJson,
} from "@/lib/tab-data-cache";
import { IconPlus, IconRefresh } from "@/components/icons";

type CardListing = Pick<
  Listing,
  | "id"
  | "title"
  | "rentCents"
  | "campus"
  | "distanceFromCampusMiles"
  | "bedrooms"
  | "bathrooms"
  | "furnishedStatus"
  | "vegPreferred"
  | "mediaLink"
>;

type MinePayload = { active: CardListing[]; inactive: CardListing[] };

function RefreshControls({
  onRefresh,
  rateLimitedSeconds,
  pending,
}: {
  onRefresh: () => void;
  rateLimitedSeconds: number | null;
  pending: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onRefresh}
        disabled={pending || rateLimitedSeconds !== null}
        className="btn btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
      >
        <IconRefresh size={14} className={pending ? "animate-spin" : undefined} />
        {pending ? "Refreshing…" : "Refresh"}
      </button>
      {rateLimitedSeconds !== null && (
        <span className="text-xs text-ink-soft">Next refresh in {rateLimitedSeconds}s</span>
      )}
    </div>
  );
}

function AvailablePanel({
  filterQuery,
  onFilterQueryChange,
  onOpenListing,
  mutationNonce,
}: {
  filterQuery: string;
  onFilterQueryChange: (q: string) => void;
  onOpenListing: (id: string) => void;
  mutationNonce: number;
}) {
  const [listings, setListings] = useState<CardListing[] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitedSeconds, setRateLimitedSeconds] = useState<number | null>(null);

  const load = useCallback(
    async (opts: { force: boolean; bypassRateLimit: boolean }) => {
      const cached = readCachedJson<CardListing[]>("available", filterQuery);

      if (!opts.force && cached) {
        setListings(cached);
        setError(null);
        setRateLimitedSeconds(null);
        return;
      }

      if (!opts.bypassRateLimit) {
        const gate = getFetchGate("available");
        if (!gate.allowed) {
          if (cached) {
            setListings(cached);
            setError(null);
          } else {
            setError(`Please wait ${formatRetrySeconds(gate.retryAfterMs)}s before loading again.`);
          }
          setRateLimitedSeconds(formatRetrySeconds(gate.retryAfterMs));
          return;
        }
      }

      setPending(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/listings/search${filterQuery ? `?${filterQuery}` : ""}`
        );
        if (!res.ok) {
          setError("Could not load listings.");
          return;
        }
        const data = (await res.json()) as { listings: CardListing[] };
        setListings(data.listings);
        writeCachedJson("available", filterQuery, data.listings);
        markFetched("available");
        setRateLimitedSeconds(null);
      } catch {
        setError("Could not load listings.");
      } finally {
        setPending(false);
      }
    },
    [filterQuery]
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load({ force: false, bypassRateLimit: false });
    }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  useEffect(() => {
    if (mutationNonce === 0) return;
    clearCachedBucket("available", filterQuery);
    const id = window.setTimeout(() => {
      void load({ force: true, bypassRateLimit: true });
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mutation signal only
  }, [mutationNonce]);

  useEffect(() => {
    if (rateLimitedSeconds === null) return;
    const id = window.setInterval(() => {
      const gate = getFetchGate("available");
      if (gate.allowed) {
        setRateLimitedSeconds(null);
        return;
      }
      setRateLimitedSeconds(formatRetrySeconds(gate.retryAfterMs));
    }, 1000);
    return () => window.clearInterval(id);
  }, [rateLimitedSeconds]);

  return (
    <CompareProvider>
      <div>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="eyebrow">Browse</span>
            <h1 className="font-display text-2xl text-ink">Available listings</h1>
          </div>
          <RefreshControls
            pending={pending}
            rateLimitedSeconds={rateLimitedSeconds}
            onRefresh={() => void load({ force: true, bypassRateLimit: false })}
          />
        </div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="lg:sticky lg:top-6">
            <ListingFilterForm
              onApplyFilters={(params) => onFilterQueryChange(params.toString())}
            />
          </div>
          <div className="flex-1">
            {error && (
              <p className="mb-4 rounded-lg border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger">
                {error}
              </p>
            )}
            {listings === null && pending ? (
              <p className="tile p-8 text-center text-ink-soft">Loading listings…</p>
            ) : listings !== null && listings.length === 0 ? (
              <p className="tile p-8 text-center text-ink-soft">No matching listings found</p>
            ) : listings ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onOpen={() => onOpenListing(listing.id)}
                    actions={<CompareToggle listingId={listing.id} />}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <CompareBar />
    </CompareProvider>
  );
}

function MyListingsPanel({
  mutationNonce,
  onOpenListing,
  onAdd,
  onEdit,
  onMutated,
}: {
  mutationNonce: number;
  onOpenListing: (id: string) => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onMutated: () => void;
}) {
  const [data, setData] = useState<MinePayload | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitedSeconds, setRateLimitedSeconds] = useState<number | null>(null);

  const load = useCallback(async (opts: { force: boolean; bypassRateLimit: boolean }) => {
    const cached = readCachedJson<MinePayload>("mine");

    if (!opts.force && cached) {
      setData(cached);
      setError(null);
      setRateLimitedSeconds(null);
      return;
    }

    if (!opts.bypassRateLimit) {
      const gate = getFetchGate("mine");
      if (!gate.allowed) {
        if (cached) {
          setData(cached);
          setError(null);
        } else {
          setError(`Please wait ${formatRetrySeconds(gate.retryAfterMs)}s before loading again.`);
        }
        setRateLimitedSeconds(formatRetrySeconds(gate.retryAfterMs));
        return;
      }
    }

    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/listings/mine");
      if (!res.ok) {
        setError("Could not load your listings.");
        return;
      }
      const payload = (await res.json()) as MinePayload;
      setData(payload);
      writeCachedJson("mine", "", payload);
      markFetched("mine");
      setRateLimitedSeconds(null);
    } catch {
      setError("Could not load your listings.");
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load({ force: false, bypassRateLimit: false });
    }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  useEffect(() => {
    if (mutationNonce === 0) return;
    clearCachedBucket("mine");
    const id = window.setTimeout(() => {
      void load({ force: true, bypassRateLimit: true });
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mutation signal only
  }, [mutationNonce]);

  useEffect(() => {
    if (rateLimitedSeconds === null) return;
    const id = window.setInterval(() => {
      const gate = getFetchGate("mine");
      if (gate.allowed) {
        setRateLimitedSeconds(null);
        return;
      }
      setRateLimitedSeconds(formatRetrySeconds(gate.retryAfterMs));
    }, 1000);
    return () => window.clearInterval(id);
  }, [rateLimitedSeconds]);

  const active = data?.active ?? [];
  const inactive = data?.inactive ?? [];
  const isEmpty = data !== null && active.length === 0 && inactive.length === 0;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="eyebrow">Manage</span>
          <h1 className="font-display text-2xl text-ink">My listings</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAdd}
            className="btn btn-primary inline-flex items-center gap-1.5"
          >
            <IconPlus size={16} />
            Add listing
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {data === null && pending && (
        <p className="tile p-8 text-center text-ink-soft">Loading your listings…</p>
      )}

      {isEmpty && <p className="tile p-8 text-center text-ink-soft">You have zero listings.</p>}

      {active.length > 0 && (
        <section>
          <h2 className="eyebrow mb-1">Active</h2>
          <p className="mb-3 text-sm text-ink-soft">
            Active listings automatically move to Inactive after 15 days and can be reactivated
            again.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            {active.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onOpen={() => onOpenListing(listing.id)}
                actions={
                  <>
                    <EditListingButton onEdit={() => onEdit(listing.id)} />
                    <RemoveListingButton listingId={listing.id} onMutated={onMutated} />
                  </>
                }
              />
            ))}
          </div>
        </section>
      )}

      {inactive.length > 0 && (
        <section>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
            Inactive
          </h2>
          <p className="mb-3 text-sm text-ink-soft">
            Inactive listings are private to you and are permanently deleted after 2 months unless
            reactivated.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            {inactive.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                actions={
                  <ReactivateListingButton listingId={listing.id} onMutated={onMutated} />
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function GlossaryPanel() {
  const entries = getGlossaryEntries();
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-col gap-1">
        <span className="eyebrow">Reference</span>
        <h1 className="font-display text-2xl text-ink">Glossary</h1>
        <p className="text-sm text-ink-soft">
          US renting terms you&apos;ll see on listings, explained.
        </p>
      </div>
      <dl className="flex flex-col divide-y divide-border">
        {entries.map((entry) => (
          <div key={entry.term} className="flex flex-col gap-1 py-4">
            <dt className="font-display text-lg text-ink">{entry.term}</dt>
            <dd className="text-sm leading-relaxed text-ink-soft">{entry.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Single-route dashboard: tabs via `?tab=`, detail/add/edit via modal query params.
 * URL updates use history.pushState (see DashboardNavProvider) so panels stay
 * mounted and tab switches stay instant.
 */
export function DashboardApp() {
  const {
    tab,
    filterQuery,
    listingId,
    editId,
    showNew,
    setFilterQuery,
    openListing,
    openNew,
    openEdit,
    closeModal,
    goToMine,
  } = useDashboardNav();

  const [mutationNonce, setMutationNonce] = useState(0);

  const afterSave = useCallback(() => {
    setMutationNonce((n) => n + 1);
    goToMine();
  }, [goToMine]);

  const bumpMutation = useCallback(() => {
    setMutationNonce((n) => n + 1);
  }, []);

  return (
    <>
      <div hidden={tab !== "available"}>
        <AvailablePanel
          filterQuery={filterQuery}
          onFilterQueryChange={setFilterQuery}
          onOpenListing={openListing}
          mutationNonce={mutationNonce}
        />
      </div>
      <div hidden={tab !== "mine"}>
        <MyListingsPanel
          mutationNonce={mutationNonce}
          onOpenListing={openListing}
          onAdd={openNew}
          onEdit={openEdit}
          onMutated={bumpMutation}
        />
      </div>
      <div hidden={tab !== "glossary"}>
        <GlossaryPanel />
      </div>

      {listingId && <ListingDetailModal listingId={listingId} onClose={closeModal} />}
      {showNew && (
        <ListingFormModal mode="create" onClose={closeModal} onSaved={afterSave} />
      )}
      {editId && (
        <ListingFormModal
          mode="edit"
          listingId={editId}
          onClose={closeModal}
          onSaved={afterSave}
        />
      )}
    </>
  );
}
