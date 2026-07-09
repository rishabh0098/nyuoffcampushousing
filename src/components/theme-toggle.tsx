"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEY, theme);
}

/**
 * Toggles the `.dark` class the inline head script (see layout.tsx) already
 * set before first paint, so there's no flash of the wrong theme. Persists
 * the explicit choice in localStorage; until a user picks one, the app
 * follows the OS `prefers-color-scheme`.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    // Deliberate mount-detection read of DOM state set synchronously by the
    // inline head script (before hydration) — there's no external store to
    // subscribe to here, just a one-time read once we're on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  if (isDark === null) {
    // Avoids a hydration mismatch: the real state is read from the DOM
    // (set synchronously by the inline script) only after mount.
    return <span className="btn btn-ghost h-9 w-9" aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={() => {
        const next = !isDark;
        setIsDark(next);
        applyTheme(next ? "dark" : "light");
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="btn btn-ghost h-9 w-9 p-0 text-lg"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
