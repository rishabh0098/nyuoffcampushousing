"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

export type DashTab = "listings" | "my-listings" | "glossary";

type DashboardShellContextValue = {
  /** Active tab when on a main tab route; null on detail/edit pages. */
  tab: DashTab | null;
  setTab: (tab: DashTab) => void;
  clientTabMode: boolean;
  mutationNonce: number;
  afterMutation: () => Promise<void>;
  listingsQuery: string;
  setListingsQuery: (q: string) => void;
};

const DashboardShellContext = createContext<DashboardShellContextValue | null>(null);

export function useDashboardShell() {
  return useContext(DashboardShellContext);
}

export function pathToTab(pathname: string): DashTab | null {
  if (pathname === "/listings") return "listings";
  if (pathname === "/my-listings") return "my-listings";
  if (pathname === "/glossary") return "glossary";
  return null;
}

export function tabToPath(tab: DashTab, listingsQuery = ""): string {
  if (tab === "listings") {
    return listingsQuery ? `/listings?${listingsQuery}` : "/listings";
  }
  if (tab === "my-listings") return "/my-listings";
  return "/glossary";
}

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeTab = pathToTab(pathname);
  const search = searchParams.toString();

  const [tab, setTabState] = useState<DashTab>(routeTab ?? "listings");
  const [listingsQuery, setListingsQuery] = useState(
    routeTab === "listings" ? search : ""
  );
  const [mutationNonce, setMutationNonce] = useState(0);
  const [routeStamp, setRouteStamp] = useState({ routeTab, search });

  // Sync from App Router navigations (e.g. returning from detail). pushState
  // tab switches update `tab` directly and do not change usePathname().
  if (
    routeTab &&
    (routeTab !== routeStamp.routeTab ||
      (routeTab === "listings" && search !== routeStamp.search && tab === "listings"))
  ) {
    setRouteStamp({ routeTab, search });
    setTabState(routeTab);
    if (routeTab === "listings") setListingsQuery(search);
  }

  useEffect(() => {
    function onPopState() {
      const next = pathToTab(window.location.pathname);
      if (next) {
        setTabState(next);
        if (next === "listings") {
          setListingsQuery(window.location.search.replace(/^\?/, ""));
        }
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setTab = useCallback(
    (next: DashTab) => {
      setTabState(next);
      const path = tabToPath(next, next === "listings" ? listingsQuery : "");
      window.history.pushState({ dashTab: next }, "", path);
    },
    [listingsQuery]
  );

  const afterMutation = useCallback(async () => {
    setMutationNonce((n) => n + 1);
  }, []);

  // pushState tab switches keep Next's pathname on the landed tab root, so
  // routeTab stays non-null and client mode remains active.
  const clientTabMode = routeTab !== null;

  const value = useMemo(
    () => ({
      tab: clientTabMode ? tab : null,
      setTab,
      clientTabMode,
      mutationNonce,
      afterMutation,
      listingsQuery,
      setListingsQuery,
    }),
    [clientTabMode, tab, setTab, mutationNonce, afterMutation, listingsQuery]
  );

  return (
    <DashboardShellContext.Provider value={value}>
      {children}
    </DashboardShellContext.Provider>
  );
}
