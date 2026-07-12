"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  buildDashboardHref,
  getFilterQueryString,
  parseDashTab,
  type DashTab,
} from "@/lib/dashboard-url";

type DashboardUrlState = {
  tab: DashTab;
  filterQuery: string;
  listingId: string | null;
  editId: string | null;
  showNew: boolean;
};

type DashboardNavContextValue = DashboardUrlState & {
  setTab: (tab: DashTab) => void;
  setFilterQuery: (filters: string) => void;
  openListing: (id: string) => void;
  openNew: () => void;
  openEdit: (id: string) => void;
  closeModal: () => void;
  goToMine: () => void;
  resetToHome: () => void;
};

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null);

function stateFromParams(params: URLSearchParams): DashboardUrlState {
  return {
    tab: parseDashTab(params),
    filterQuery: getFilterQueryString(params),
    listingId: params.get("listing"),
    editId: params.get("edit"),
    showNew: params.get("new") === "1",
  };
}

function hrefFromState(state: DashboardUrlState): string {
  return buildDashboardHref({
    tab: state.tab,
    filters: state.tab === "available" ? state.filterQuery : undefined,
    listing: state.listingId,
    newListing: state.showNew,
    edit: state.editId,
  });
}

/**
 * Owns dashboard URL state locally and syncs the address bar with
 * history.pushState/replaceState — no App Router navigation, so tab
 * switches and modal open/close stay instant while panels stay mounted.
 */
export function DashboardNavProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [state, setState] = useState<DashboardUrlState>(() =>
    stateFromParams(new URLSearchParams(searchParams.toString()))
  );

  // Real Next navigations (redirects, hard links) still update searchParams.
  useEffect(() => {
    setState(stateFromParams(new URLSearchParams(searchParams.toString())));
  }, [searchParams]);

  useEffect(() => {
    function onPopState() {
      setState(stateFromParams(new URLSearchParams(window.location.search)));
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const commit = useCallback(
    (updater: (prev: DashboardUrlState) => DashboardUrlState, mode: "push" | "replace") => {
      setState((prev) => {
        const next = updater(prev);
        const href = hrefFromState(next);
        if (mode === "push") window.history.pushState(null, "", href);
        else window.history.replaceState(null, "", href);
        return next;
      });
    },
    []
  );

  const setTab = useCallback(
    (tab: DashTab) => {
      commit(
        (prev) => ({
          tab,
          filterQuery: prev.filterQuery,
          listingId: null,
          editId: null,
          showNew: false,
        }),
        "push"
      );
    },
    [commit]
  );

  const setFilterQuery = useCallback(
    (filters: string) => {
      commit(
        () => ({
          tab: "available",
          filterQuery: filters,
          listingId: null,
          editId: null,
          showNew: false,
        }),
        "replace"
      );
    },
    [commit]
  );

  const openListing = useCallback(
    (id: string) => {
      commit(
        (prev) => ({
          ...prev,
          listingId: id,
          editId: null,
          showNew: false,
        }),
        "push"
      );
    },
    [commit]
  );

  const openNew = useCallback(() => {
    commit(
      (prev) => ({
        tab: "mine",
        filterQuery: prev.filterQuery,
        listingId: null,
        editId: null,
        showNew: true,
      }),
      "push"
    );
  }, [commit]);

  const openEdit = useCallback(
    (id: string) => {
      commit(
        (prev) => ({
          tab: "mine",
          filterQuery: prev.filterQuery,
          listingId: null,
          editId: id,
          showNew: false,
        }),
        "push"
      );
    },
    [commit]
  );

  const closeModal = useCallback(() => {
    commit(
      (prev) => ({
        ...prev,
        listingId: null,
        editId: null,
        showNew: false,
      }),
      "replace"
    );
  }, [commit]);

  const goToMine = useCallback(() => {
    commit(
      (prev) => ({
        tab: "mine",
        filterQuery: prev.filterQuery,
        listingId: null,
        editId: null,
        showNew: false,
      }),
      "replace"
    );
  }, [commit]);

  const resetToHome = useCallback(() => {
    commit(
      () => ({
        tab: "available",
        filterQuery: "",
        listingId: null,
        editId: null,
        showNew: false,
      }),
      "push"
    );
  }, [commit]);

  const value = useMemo(
    () => ({
      ...state,
      setTab,
      setFilterQuery,
      openListing,
      openNew,
      openEdit,
      closeModal,
      goToMine,
      resetToHome,
    }),
    [
      state,
      setTab,
      setFilterQuery,
      openListing,
      openNew,
      openEdit,
      closeModal,
      goToMine,
      resetToHome,
    ]
  );

  return (
    <DashboardNavContext.Provider value={value}>{children}</DashboardNavContext.Provider>
  );
}

export function useDashboardNav() {
  const ctx = useContext(DashboardNavContext);
  if (!ctx) throw new Error("useDashboardNav must be used within DashboardNavProvider");
  return ctx;
}
