import { CircleHelp, Cpu, Fish, Globe2, MapPin, Package } from "lucide-react";

import type { GuideCategory, GuideEntry } from "../types/guide.types";

interface GuideCardProps {
  entry: GuideEntry;
}

const categoryIcons: Record<GuideCategory, typeof Globe2> = {
  planet: Globe2,
  species: Fish,
  place: MapPin,
  technology: Cpu,
  object: Package,
};

const classificationLabels = {
  "mostly-harmless": "Mostly harmless",
  safe: "Safe",
  caution: "Caution advised",
  dangerous: "Dangerous",
  legendary: "Legendary",
  unknown: "Unknown",
};

export function GuideCard({ entry }: GuideCardProps) {
  const Icon = categoryIcons[entry.category] ?? CircleHelp;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-700 bg-slate-800/80 p-6 transition hover:border-slate-500">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm uppercase tracking-wider text-teal-400">
          <Icon size={18} aria-hidden="true" />

          <span>{entry.category}</span>
        </div>

        <span className="rounded-full border border-slate-600 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
          {classificationLabels[entry.classification]}
        </span>
      </div>

      <h2 className="text-2xl font-medium text-slate-100">{entry.name}</h2>

      <p className="mt-3 flex-1 leading-7 text-slate-400">{entry.summary}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {entry.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-slate-900/60 px-2.5 py-1 text-xs text-slate-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <button
        type="button"
        disabled
        className="mt-6 self-start text-sm font-medium text-amber-400 opacity-70"
        title="Guide entry details will be available in a future phase"
      >
        Full entry coming soon
      </button>
    </article>
  );
}
