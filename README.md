# NYU Off-Campus Housing Portal

An NYU-email-gated portal for off-campus housing listings. Students sign in with
an `@nyu.edu` Google account, then browse/filter Available listings, compare up
to three side-by-side, manage their own listings on My listings (Active /
Inactive, with 15-day auto-expiry and reactivation), and read an alphabetical
renting glossary. No bookings, payments, or in-app messaging — contact is
direct (WhatsApp / email / phone on each listing).

Licensed under [MIT](./LICENSE). See [CONTRIBUTING.md](./CONTRIBUTING.md) if
you want to help.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript, Tailwind CSS)
- [Prisma](https://www.prisma.io) + [Neon](https://neon.tech) Postgres (via Vercel Marketplace)
- Google OAuth 2.0 (Authorization Code flow, `nyu.edu` domain only)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for listing photos
- [Vercel Cron](https://vercel.com/docs/cron-jobs) for the listing lifecycle job

> **Note:** Next.js 16 renamed Middleware to
> [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
> (`src/proxy.ts`) — same role, different file name/export.

## Features

- **Available listings** — filter by area (NYC boroughs + key Jersey City areas),
  campus, rent, bedrooms, lease type, amenities, and more; photo carousel on cards
- **Compare** — select up to 3 listings and compare side-by-side
- **My listings** — create/edit, remove (→ Inactive), reactivate; Active listings
  auto-expire after 15 days; Inactive listings are purged after ~2 months
- **Glossary** — starter renting terms for students new to NYC leases

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in real values:

   ```bash
   cp .env.example .env.local
   ```

   You'll need:

   - `DATABASE_URL` — Neon (or any Postgres) connection string
   - `SESSION_SECRET` — `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Web application OAuth client
     from [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
     with `http://localhost:3000/api/auth/google/callback` (and your deployed
     callback URLs) as authorized redirect URIs
   - `BLOB_READ_WRITE_TOKEN` — Vercel Blob read/write token
   - `CRON_SECRET` — `openssl rand -base64 32` (must match Vercel Cron config)

3. Apply migrations:

   ```bash
   npx prisma migrate dev
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

## Deploy (Vercel)

Typical setup used by this project:

- **Production** and **Preview** each have their own Neon database (separate
  Marketplace resources), so test listings on `dev` do not affect production
- Shared: Google OAuth clients (register both prod and stable preview callback
  URLs), Blob store, session/cron secrets
- Cron: `GET /api/cron/expire-listings` daily (see `vercel.json`)

## Testing

```bash
npm test        # run once
npm run test:watch
```

Unit tests cover Google domain/email verification
(`src/lib/google-oauth.test.ts`), listing filter query-building
(`src/lib/listing-filters.test.ts`), and lifecycle expiry thresholds
(`src/lib/listing-lifecycle.test.ts`). Full request/response integration
testing needs a real Postgres database and a live Google OAuth round trip.

## Project structure

- `src/app/login` — “Sign in with NYU email”
- `src/app/(dashboard)` — Available listings, My listings, Glossary
- `src/app/api/auth` — Google OAuth redirect/callback + logout
- `src/app/api/listings` — listings CRUD, photos, compare
- `src/app/api/cron` — Active→Inactive expiry and Inactive purge
- `src/components` — cards, filters, compare UI, forms, footer
- `src/lib` — session, OAuth, filters, lifecycle, constants
- `src/proxy.ts` — session gate + sliding-expiry refresh
- `prisma/` — schema + migrations
