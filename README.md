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
- Cloud media links (Google Drive and other allowlisted hosts) instead of uploads
- [Vercel Cron](https://vercel.com/docs/cron-jobs) for the listing lifecycle job

> **Note:** Next.js 16 renamed Middleware to
> [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
> (`src/proxy.ts`) — same role, different file name/export.

## Features

- **Available listings** — filter by area (NYC boroughs + key Jersey City areas),
  campus, rent, bedrooms, lease type, amenities, and more; optional Drive/media link
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
   - `CONTACT_ENCRYPTION_KEY` — `openssl rand -base64 32` (AES-256 key for contact fields)
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

**Do not share secrets between Production and Preview.** Each environment needs
its own database and its own secrets.

### Environment checklist (Vercel → Project → Settings → Environment Variables)

For **Production** and again for **Preview** (separate values each time):

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Separate Neon database / branch per environment |
| `SESSION_SECRET` | Distinct `openssl rand -base64 32` |
| `CRON_SECRET` | Distinct `openssl rand -base64 32` |
| `CONTACT_ENCRYPTION_KEY` | Distinct `openssl rand -base64 32` (32-byte AES key) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Prefer separate OAuth clients; at minimum register distinct redirect URIs for prod vs preview hostnames |

Also:

- Cron: `GET /api/cron/expire-listings` daily (see `vercel.json`) — uses that env’s `CRON_SECRET`
- After deploy, run `npx prisma migrate deploy` against each database

### Row Level Security

Migrations enable Postgres RLS on `"Listing"` with policies that read
transaction-local GUCs (`app.current_user_email`, `app.is_service`). The app
sets these via `set_config(..., true)` inside Prisma interactive transactions
(safe on Neon’s transaction-mode pooler).

**Residual risk:** Neon roles created in the Console inherit `BYPASSRLS`
(`neon_superuser`). Policies only *enforce* when `DATABASE_URL` uses a
SQL-created role **without** `BYPASSRLS`. App-level `posterEmail` ownership
checks remain defense in depth either way. Cron uses `app.is_service = on`.

Optional hardening: create an `app_user` LOGIN role in SQL (not Console), grant
DML on `"Listing"`, point the app `DATABASE_URL` at it, and keep an owner URL
for migrations only.

### Contact encryption

`contactWhatsapp`, `contactEmail`, and `contactPhone` are stored with AES-256-GCM
and decrypted only in authenticated API responses. Legacy plaintext rows still
read until the listing is updated. `posterEmail` stays plaintext for ownership
queries and RLS.

### Google Drive media

Posters paste a Drive (or other allowlisted cloud) link. Prefer sharing with
“anyone at nyu.edu with the link.” Viewers must be signed into their NYU Google
account for org-restricted content — the app cannot bypass Drive ACLs. Detail
and compare UIs embed when possible and always offer an “Open in Google Drive”
fallback.

## Testing

```bash
npm test        # run once
npm run test:watch
```

Unit tests cover Google domain/email verification, listing filters, lifecycle
thresholds, media URL allowlisting/embed resolution, and contact encryption.
Full request/response integration testing needs a real Postgres database and a
live Google OAuth round trip.

## Project structure

- `src/app/login` — “Sign in with NYU email”
- `src/app/(dashboard)` — Available listings, My listings, Glossary
- `src/app/api/auth` — Google OAuth redirect/callback + logout
- `src/app/api/listings` — listings CRUD + compare
- `src/app/api/cron` — Active→Inactive expiry and Inactive purge
- `src/components` — cards, filters, compare UI, forms, footer
- `src/lib` — session, OAuth, filters, lifecycle, media URLs, contact crypto, RLS helpers, constants
- `src/proxy.ts` — session gate + sliding-expiry refresh
- `prisma/` — schema + migrations
