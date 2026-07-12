# Contributing

Thanks for helping improve the NYU Off-Campus Housing Portal. This is a
volunteer / community project for NYU students — keep the product useful,
trustworthy, and free of commercial clutter.

## Ways to contribute

- Bug fixes and reliability improvements
- UI polish that stays consistent with the existing design
- Copy / glossary updates that help students renting off campus
- Tests for logic that can regress quietly (filters, OAuth checks, lifecycle,
  media URL validation)
- Docs that make setup or contribution clearer

Please open an issue first for large features or scope changes (e.g. payments,
messaging, maps vendors, non-`nyu.edu` access).

## Development setup

Follow the [README](./README.md) for install, env vars, migrations, and
`npm run dev`.

Quick check before you open a PR:

```bash
npm test
npm run lint
npm run build
```

You need an `@nyu.edu` Google account to exercise the signed-in app against a
real OAuth client. Local development uses `http://localhost:3000/api/auth/google/callback`
as the redirect URI.

## Branching and pull requests

1. Fork the repo (or create a branch from `main` if you have write access).
2. Create a focused branch: `fix/…`, `feat/…`, or `docs/…`.
3. Keep PRs small and reviewable — one concern per PR when possible.
4. Open a PR against **`main`**.
5. Fill in a short summary and how you tested (commands + any manual steps).

Maintainers typically:

- Merge to `main` for Production
- Also update `dev` so the stable Preview deployment stays in sync

Do not commit secrets (`.env`, `.env.local`, tokens, connection strings).
`.env.example` is the only env template that belongs in git.

## Project conventions

- **Next.js 16** — request interception lives in `src/proxy.ts` (Proxy), not a
  `middleware.ts` file. Prefer checking `node_modules/next/dist/docs/` when APIs
  look unfamiliar.
- **Auth** — only `@nyu.edu` Google accounts. Session cookies are signed and use
  a sliding expiry; don’t introduce alternate auth without discussion.
- **Data** — schema changes go through Prisma migrations under `prisma/migrations/`.
  Never edit an already-applied migration on shared databases; add a new one.
- **Lifecycle** — Active listings expire after 15 days; Inactive listings are
  purged after ~2 months (`src/lib/constants.ts` + cron route). Keep UI copy in
  sync when changing those numbers.
- **Media** — posters paste allowlisted HTTPS cloud links (Drive, etc.); no
  server-side image upload. Document NYU Drive sharing in form helper text.
- **Secrets** — Production and Preview must use **distinct** `SESSION_SECRET`,
  `CRON_SECRET`, OAuth clients/redirects, and databases. Never reuse those
  across environments.
- **Tone** — community / volunteer, not commercial. Avoid marketing chrome,
  hard sells, or unrelated monetization.
- **Scope (v1)** — no bookings, payments, or in-app messaging. Contact stays on
  the listing (WhatsApp / email / phone).

## Where things live

| Area | Location |
| --- | --- |
| Pages | `src/app/(dashboard)/`, `src/app/login/` |
| API routes | `src/app/api/` |
| Shared UI | `src/components/` |
| Domain logic | `src/lib/` |
| Schema / migrations | `prisma/` |
| Product history | `docs/brainstorms/`, `docs/plans/` |

Prefer putting reusable logic in `src/lib/` and keeping route handlers thin.

## Database and Preview notes

Production and Preview use **separate Neon databases**. Listings you create on
Preview will not appear in Production (and vice versa).

If you change the Prisma schema:

1. `npx prisma migrate dev --name your_change`
2. Commit the generated SQL under `prisma/migrations/`
3. Mention in the PR that a migrate deploy is needed on Preview/Production

## Code review expectations

- TypeScript should typecheck; avoid `any` unless unavoidable and justified
- Match existing naming, layout patterns, and Tailwind usage
- Add or update unit tests when you change filter, OAuth, lifecycle, or media URL
  logic
- Don’t expand product scope in a “drive-by” PR

## License

By contributing, you agree that your contributions are licensed under the
project’s [MIT License](./LICENSE).
