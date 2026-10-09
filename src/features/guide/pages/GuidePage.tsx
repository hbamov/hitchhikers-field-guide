import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { GuideCard } from "../components/GuideCard";
import type { GuideCategory } from "../types/guide.types";
import { useGuideEntries } from "../hooks/useGuideEntries";
import { GuideCardSkeleton } from "../components/GuideCardSkeleton/GuideCardSkeleton";

type CategoryFilter = "all" | GuideCategory;

const categoryFilters: {
  label: string;
  value: CategoryFilter;
}[] = [
  { label: "All", value: "all" },
  { label: "Planets", value: "planet" },
  { label: "Species", value: "species" },
  { label: "Places", value: "place" },
  { label: "Technology", value: "technology" },
  { label: "Objects", value: "object" },
];

export function GuidePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("all");

  const {
    data: guideEntries = [],
    isLoading,
    error,
    isError,
    refetch,
  } = useGuideEntries();

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return guideEntries.filter((entry) => {
      const matchesCategory =
        selectedCategory === "all" || entry.category === selectedCategory;

      const searchableText = [entry.name, entry.summary, ...entry.tags]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedSearch === "" || searchableText.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [guideEntries, search, selectedCategory]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
  };

  const hasActiveFilters = search.trim() !== "" || selectedCategory !== "all";

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-6" aria-busy="true">
        <p role="status" className="sr-only">
          Consulting the Guide...
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <GuideCardSkeleton key={i} />
          ))}
        </div>
      </main>
    );
  }

  if (isError) {
    console.error("Failed to load guide entries:", error);

    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-12 lg:py-16">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-8">
          <h1 className="text-xl font-medium text-slate-100">
            The Guide is temporarily unavailable
          </h1>

          <p className="mt-2 text-slate-400">
            Something went wrong while retrieving the collected knowledge of the
            galaxy.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-6 lg:py-6">
      <section>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-400">
          Galactic database
        </p>

        <h1 className="mt-3 text-4xl font-medium tracking-tight text-slate-100 md:text-5xl">
          The Guide
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">
          Search the collected knowledge of the galaxy. Accuracy, completeness
          and personal safety are not guaranteed.
        </p>
      </section>

      <section className="mt-10" aria-label="Search and filter Guide entries">
        <div className="relative">
          <Search
            size={20}
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search planets, species, places..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 py-4 pl-12 pr-12 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-500"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categoryFilters.map((category) => {
            const isSelected = selectedCategory === category.value;

            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setSelectedCategory(category.value)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  isSelected
                    ? "border-teal-500 bg-teal-500/10 text-teal-300"
                    : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm uppercase tracking-wider text-slate-500">
            {filteredEntries.length}{" "}
            {filteredEntries.length === 1 ? "guide entry" : "guide entries"}
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-slate-400 transition hover:text-slate-100"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredEntries.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredEntries.map((entry) => (
              <GuideCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 px-6 py-16 text-center">
            <CircleHelpIcon />

            <h2 className="mt-5 text-xl font-medium text-slate-100">
              No Guide entries found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-400">
              The Guide appears to know nothing about that. Try another search
              or clear your filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-400"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function CircleHelpIcon() {
  return (
    <div
      className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-600 text-xl text-slate-400"
      aria-hidden="true"
    >
      ?
    </div>
  );
}
