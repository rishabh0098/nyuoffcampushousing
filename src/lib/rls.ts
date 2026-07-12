import "server-only";
import { prisma } from "./db";
import type { Prisma, PrismaClient } from "@prisma/client";

type TxClient = Prisma.TransactionClient;

/**
 * Run `fn` inside a transaction after setting `app.current_user_email` via
 * SET LOCAL (`set_config(..., true)`), which is safe on Neon’s transaction-
 * mode PgBouncer pooler.
 *
 * Policies on "Listing" use this GUC for ownership checks. App-level
 * `posterEmail` filters remain as defense in depth.
 *
 * Residual risk: Neon Console / `neon_superuser` roles have BYPASSRLS, so
 * policies only enforce when DATABASE_URL uses a SQL-created non-bypass role.
 * See README “Row Level Security”.
 */
export async function withUserRls<T>(
  userEmail: string,
  fn: (tx: TxClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_user_email', ${userEmail}, true)`;
    await tx.$executeRaw`SELECT set_config('app.is_service', 'off', true)`;
    return fn(tx);
  });
}

/**
 * Cron / batch path: sets `app.is_service = on` so RLS policies allow
 * lifecycle UPDATE/DELETE across all listings without impersonating a user.
 */
export async function withServiceRls<T>(fn: (tx: TxClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_service', 'on', true)`;
    await tx.$executeRaw`SELECT set_config('app.current_user_email', '', true)`;
    return fn(tx);
  });
}

/** Default client for Active-only reads that don’t need a user GUC. */
export function db(): PrismaClient {
  return prisma;
}
