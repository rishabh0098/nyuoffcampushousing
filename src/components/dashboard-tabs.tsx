"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Listing, ListingPhoto } from "@prisma/client";
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
import { getGlossaryEntries } from "@/lib/glossary";
import { useDashboardShell } from "@/lib/dashboard-shell-context";
import {
  clearCachedBucket,
  formatRetrySeconds,
  getFetchGate,
  markFetched,
  readCachedJson,
  writeCachedJson,
} from "@/lib/tab-data-cache";

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
  | "status"
> & { photos: Pick<ListingPhoto, "id" | "url">[] };

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
        className="btn btn-secondary px-3 py-1.5 text-xs"
      >
        {pending ? "Refreshing…" : "Refresh"}
      </button>
      {rateLimitedSeconds !== null && (
        <span className="text-xs text-ink-soft">Next refresh in {rateLimitedSeconds}s</span>
      )}
    </div>
  );
}

function AvailablePanel({
  queryString,
  onQueryStringChange,
  mutationNonce,
}: {
  queryString: string;
  onQueryStringChange: (q: string) => void;
  mutationNonce: number;
}) {
  const [listings, setListings] = useState<CardListing[] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitedSeconds, setRateLimitedSeconds] = useState<number | null>(null);

  const load = useCallback(
    async (opts: { force: boolean; bypassRateLimit: boolean }) => {
      const cached = readCachedJson<CardListing[]>("available", queryString);

      if (!opts.force && cached) {
        setListings(cached);
        setError(null);
        setRateLimitedSeconds(null);
        return;
      }

      // Rate limit is global for Available fetches (not per filter), so changing
      // filters cannot bypass the cooldown.
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
          `/api/listings/search${queryString ? `?${queryString}` : ""}`
        );
        if (!res.ok) {
          setError("Could not load listings.");
          return;
        }
        const data = (await res.json()) as { listings: CardListing[] };
        setListings(data.listings);
        writeCachedJson("available", queryString, data.listings);
        markFetched("available");
        setRateLimitedSeconds(null);
      } catch {
        setError("Could not load listings.");
      } finally {
        setPending(false);
      }
    },
    [queryString]
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load({ force: false, bypassRateLimit: false });
    }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  useEffect(() => {
    if (mutationNonce === 0) return;
    clearCachedBucket("available", queryString);
    // Defer so we don't sync-setState inside the effect body (lint).
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
              onApplyFilters={(params) => {
                const next = params.toString();
                onQueryStringChange(next);
                window.history.replaceState(
                  { dashTab: "listings" },
                  "",
                  next ? `/listings?${next}` : "/listings"
                );
              }}
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
                    href={`/listings/${listing.id}`}
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

function MyListingsPanel({ mutationNonce }: { mutationNonce: number }) {
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
          <RefreshControls
            pending={pending}
            rateLimitedSeconds={rateLimitedSeconds}
            onRefresh={() => void load({ force: true, bypassRateLimit: false })}
          />
          <Link href="/my-listings/new" className="btn btn-primary">
            Add listing
          </Link>
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
                href={`/listings/${listing.id}`}
                actions={
                  <>
                    <EditListingButton listingId={listing.id} />
                    <RemoveListingButton listingId={listing.id} />
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
                actions={<ReactivateListingButton listingId={listing.id} />}
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
 * Client tab panels for Available / My listings / Glossary. Kept mounted while
 * switching tabs so data stays in memory; sessionStorage covers reload spam.
 */
export function DashboardTabs() {
  const shell = useDashboardShell();
  if (!shell?.clientTabMode || !shell.tab) return null;

  return (
    <>
      <div hidden={shell.tab !== "listings"}>
        <AvailablePanel
          queryString={shell.listingsQuery}
          onQueryStringChange={shell.setListingsQuery}
          mutationNonce={shell.mutationNonce}
        />
      </div>
      <div hidden={shell.tab !== "my-listings"}>
        <MyListingsPanel mutationNonce={shell.mutationNonce} />
      </div>
      <div hidden={shell.tab !== "glossary"}>
        <GlossaryPanel />
      </div>
    </>
  );
}
