import { getGlossaryEntries } from "@/lib/glossary";

export default function GlossaryPage() {
  const entries = getGlossaryEntries();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-col gap-1">
        <span className="eyebrow">Reference</span>
        <h1 className="font-display text-2xl text-ink">Glossary</h1>
        <p className="text-sm text-ink-soft">
          US renting terms you&apos;ll see on listings, explained.
        </p>
      </div>
      <dl className="flex flex-col divide-y divide-border">
        {entries.map((entry) => (
          <div key={entry.term} className="flex flex-col gap-1 py-4">
            <dt className="font-display text-lg text-ink">{entry.term}</dt>
            <dd className="text-sm leading-relaxed text-ink-soft">{entry.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
