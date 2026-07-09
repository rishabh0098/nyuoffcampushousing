# NYU Off-Campus Housing Portal

An NYU-email-gated showcase for off-campus housing listings. Students sign in
with their NYU (`@nyu.edu`) Google account, then browse and filter Available
listings, manage their own listings on My Listings (Active/Inactive, with
15-day auto-expiry and reactivation), and read an alphabetical renting
glossary. No bookings, payments, or in-app messaging — see
[`docs/plans`](./docs/plans) for the full plan and
[`docs/brainstorms`](./docs/brainstorms) for the originating requirements.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript, Tailwind CSS)
- [Prisma](https://www.prisma.io) + Postgres
- Google OAuth 2.0 (Authorization Code flow, restricted to the `nyu.edu` domain) for sign-in
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for listing photos
- [Vercel Cron](https://vercel.com/docs/cron-jobs) for the listing lifecycle job

> **Note:** this project targets Next.js 16, which renamed Middleware to
> [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
> (`src/proxy.ts`) — functionality is the same, just the file name and export
> changed.

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
   - A Postgres connection string (`DATABASE_URL`) — [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or [Neon](https://neon.tech) both work.
   - A session signing secret (`SESSION_SECRET`) — generate with `openssl rand -base64 32`.
   - A Google OAuth 2.0 Client ID/Secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (Web application type), with `http://localhost:3000/api/auth/google/callback` added as an authorized redirect URI for local dev (and your production/preview domains' equivalent path).
   - A [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) read/write token.
   - A `CRON_SECRET` shared with the Vercel Cron job config in `vercel.json` — generate with `openssl rand -base64 32`.

3. Apply the Prisma schema to your database:

   ```bash
   npx prisma migrate dev
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

## Testing

```bash
npm test        # run once
npm run test:watch
```

Unit tests focus on the logic most likely to regress silently without a
database in the loop: the NYU-domain/email-verification decision for Google
sign-in (`src/lib/google-oauth.test.ts`), listing filter query-building
(`src/lib/listing-filters.test.ts`), and listing lifecycle expiry thresholds
(`src/lib/listing-lifecycle.test.ts`). Full request/response integration
testing requires a real Postgres database and a live Google OAuth round trip.

## Project structure

- `src/app/login` — sign-in page with a "Sign in with Google" button
- `src/app/(dashboard)` — the three-tab dashboard: Available listings, My
  listings, Glossary (shared nav in `layout.tsx`)
- `src/app/api/auth` — Google OAuth redirect/callback routes and logout
- `src/app/api` — route handlers for auth, listings, listing photos, and the
  lifecycle cron job
- `src/lib` — framework-agnostic logic: session/google-oauth/listings/filters/lifecycle
- `src/proxy.ts` — session check + sliding-expiry refresh on every request
- `prisma/schema.prisma` — data model
