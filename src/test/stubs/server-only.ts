// Test-only stub: the real `server-only` package throws when imported
// outside a Next.js Server Component bundle. Vitest runs plain Node, so we
// alias it to a no-op here (see vitest.config.ts) purely to make lib modules
// importable in tests; it has no effect on the app's actual server-only guard.
export {};
