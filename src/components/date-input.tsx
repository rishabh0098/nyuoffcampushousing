"use client";

import { useState } from "react";

// Native `<input type="date">` renders in whatever format the user's
// browser/OS locale dictates (dd/mm/yyyy for many locales), which we can't
// override from the page — there's no HTML/CSS way to force a display
// format on it. This masked text input guarantees mm/dd/yyyy for everyone,
// regardless of locale, while still submitting a real ISO date string via a
// hidden field so existing `form.get(name)` / zod `z.coerce.date()` code
// doesn't need to change.

function isoToDisplay(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, y, m, d] = match;
  return `${m}/${d}/${y}`;
}

function displayToIso(display: string): string {
  const match = display.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return "";
  const [, m, d, y] = match;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function formatAsTyped(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join("/");
}

export function DateInput({
  name,
  defaultValue = "",
  className = "input",
  onIsoChange,
}: {
  name: string;
  defaultValue?: string;
  className?: string;
  onIsoChange?: (iso: string) => void;
}) {
  const [display, setDisplay] = useState(() => isoToDisplay(defaultValue));
  const iso = displayToIso(display);

  return (
    <>
      <input
        type="text"
        inputMode="numeric"
        placeholder="mm/dd/yyyy"
        value={display}
        onChange={(e) => {
          const next = formatAsTyped(e.target.value);
          setDisplay(next);
          onIsoChange?.(displayToIso(next));
        }}
        className={className}
      />
      <input type="hidden" name={name} value={iso} />
    </>
  );
}
