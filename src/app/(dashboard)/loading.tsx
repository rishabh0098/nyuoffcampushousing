/**
 * Fallback while the dashboard layout/page RSC payload is loading
 * (e.g. session check on first navigation to /listings).
 */
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-16 animate-pulse rounded bg-border" />
        <div className="h-7 w-48 animate-pulse rounded bg-border" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="tile flex flex-col gap-3 p-4">
            <div className="aspect-[4/3] animate-pulse rounded-lg bg-border" />
            <div className="h-5 w-40 animate-pulse rounded bg-border" />
            <div className="h-5 w-24 animate-pulse rounded bg-border" />
            <div className="h-4 w-full animate-pulse rounded bg-border" />
          </div>
        ))}
      </div>
    </div>
  );
}
