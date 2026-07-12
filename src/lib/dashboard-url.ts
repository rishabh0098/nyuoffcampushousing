export type DashTab = "available" | "mine" | "glossary";

export function parseDashTab(params: URLSearchParams): DashTab {
  const tab = params.get("tab");
  if (tab === "mine" || tab === "glossary") return tab;
  return "available";
}

/** Filter query keys used on the Available tab (excludes tab/modal params). */
const MODAL_KEYS = new Set(["tab", "listing", "new", "edit"]);

export function getFilterQueryString(params: URLSearchParams): string {
  const filters = new URLSearchParams();
  for (const [key, value] of params.entries()) {
    if (!MODAL_KEYS.has(key) && value !== "") filters.set(key, value);
  }
  return filters.toString();
}

export function buildDashboardHref(options: {
  tab?: DashTab;
  filters?: string | URLSearchParams;
  listing?: string | null;
  newListing?: boolean;
  edit?: string | null;
}): string {
  const params = new URLSearchParams();
  const tab = options.tab ?? "available";
  if (tab !== "available") params.set("tab", tab);

  if (tab === "available" && options.filters) {
    const filters =
      typeof options.filters === "string"
        ? new URLSearchParams(options.filters)
        : options.filters;
    for (const [key, value] of filters.entries()) {
      if (!MODAL_KEYS.has(key) && value !== "") params.set(key, value);
    }
  }

  if (options.listing) params.set("listing", options.listing);
  if (options.newListing) params.set("new", "1");
  if (options.edit) params.set("edit", options.edit);

  const qs = params.toString();
  return qs ? `/listings?${qs}` : "/listings";
}
