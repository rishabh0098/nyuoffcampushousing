export type GlossaryEntry = {
  term: string;
  definition: string;
};

// R15, R17 — starter glossary content. Static, version-controlled list (no
// admin UI, per Scope Boundaries); exact copy is a content-authoring task,
// not a technical one — extend this list directly as content is drafted.
const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    term: "Guarantor",
    definition:
      "A person (often a parent or sponsor) who agrees to pay rent if the tenant can't. Many NYC landlords require a guarantor who earns 80x the monthly rent, or a guarantor insurance service, especially for students or those without US credit history.",
  },
  {
    term: "Laundromat",
    definition:
      "A self-service laundry facility with coin- or card-operated washers and dryers, common in NYC apartments that don't have in-unit or in-building laundry.",
  },
  {
    term: "Lease takeover",
    definition:
      "Taking over someone else's existing lease for the remainder of its term, instead of signing a brand-new lease. Common among students subletting mid-year; terms and landlord approval requirements vary.",
  },
  {
    term: "Security deposit",
    definition:
      "An upfront payment (commonly one month's rent) held by the landlord to cover damage or unpaid rent, returned at move-out minus any deductions.",
  },
  {
    term: "Sublet",
    definition:
      "Renting out a space you already lease to someone else, temporarily, usually with the original tenant's name staying on the lease and the landlord's permission required.",
  },
  {
    term: "Utilities",
    definition:
      "Recurring services like electricity, gas, water, and internet/wifi. Listings should say clearly whether these are included in rent or billed separately.",
  },
];

/** R16 — glossary entries are always displayed in alphabetical order. */
export function getGlossaryEntries(): GlossaryEntry[] {
  return [...GLOSSARY_ENTRIES].sort((a, b) => a.term.localeCompare(b.term));
}
