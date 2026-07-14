"use client";

import { CLIENT_FETCH_MIN_INTERVAL_MS } from "@/lib/constants";

// Bump when cached listing payloads change shape (e.g. mediaLink → photos).
const CACHE_VERSION = "v2";
const FETCH_AT_PREFIX = `nyu-och:${CACHE_VERSION}:fetchAt:`;
const DATA_PREFIX = `nyu-och:${CACHE_VERSION}:data:`;

export type CacheBucket = "available" | "mine";

function fetchAtKey(bucket: CacheBucket, suffix = ""): string {
  return `${FETCH_AT_PREFIX}${bucket}${suffix ? `:${suffix}` : ""}`;
}

function dataKey(bucket: CacheBucket, suffix = ""): string {
  return `${DATA_PREFIX}${bucket}${suffix ? `:${suffix}` : ""}`;
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function getLastFetchAt(bucket: CacheBucket, suffix = ""): number {
  const raw = storage()?.getItem(fetchAtKey(bucket, suffix));
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function markFetched(bucket: CacheBucket, suffix = "", at = Date.now()): void {
  storage()?.setItem(fetchAtKey(bucket, suffix), String(at));
}

export function readCachedJson<T>(bucket: CacheBucket, suffix = ""): T | null {
  const raw = storage()?.getItem(dataKey(bucket, suffix));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeCachedJson(bucket: CacheBucket, suffix: string, value: unknown): void {
  storage()?.setItem(dataKey(bucket, suffix), JSON.stringify(value));
}

export function clearCachedBucket(bucket: CacheBucket, suffix = ""): void {
  const s = storage();
  s?.removeItem(dataKey(bucket, suffix));
  s?.removeItem(fetchAtKey(bucket, suffix));
}

/** Rate limit for refresh / reload network calls. Mutations should bypass. */
export function getFetchGate(
  bucket: CacheBucket,
  suffix = ""
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const elapsed = Date.now() - getLastFetchAt(bucket, suffix);
  if (elapsed >= CLIENT_FETCH_MIN_INTERVAL_MS) {
    return { allowed: true };
  }
  return { allowed: false, retryAfterMs: CLIENT_FETCH_MIN_INTERVAL_MS - elapsed };
}

export function formatRetrySeconds(retryAfterMs: number): number {
  return Math.max(1, Math.ceil(retryAfterMs / 1000));
}
