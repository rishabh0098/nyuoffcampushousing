import { describe, expect, it } from "vitest";
import { getGlossaryEntries } from "./glossary";

describe("getGlossaryEntries", () => {
  it("returns entries sorted alphabetically by term, regardless of source order", () => {
    const entries = getGlossaryEntries();
    const terms = entries.map((e) => e.term);
    const sorted = [...terms].sort((a, b) => a.localeCompare(b));
    expect(terms).toEqual(sorted);
  });

  it("includes starter terms mentioned in the requirements (R15)", () => {
    const terms = getGlossaryEntries().map((e) => e.term);
    expect(terms).toContain("Guarantor");
    expect(terms).toContain("Laundromat");
    expect(terms).toContain("Lease takeover");
  });
});
