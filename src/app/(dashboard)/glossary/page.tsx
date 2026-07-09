import { getGlossaryEntries } from "@/lib/glossary";

export default function GlossaryPage() {
  const entries = getGlossaryEntries();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-lg font-semibold">Glossary</h1>
      <dl className="flex flex-col gap-4">
        {entries.map((entry) => (
          <div key={entry.term}>
            <dt className="font-medium">{entry.term}</dt>
            <dd className="text-sm text-gray-600">{entry.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
