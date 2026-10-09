export function GuideCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full animate-pulse flex-col rounded-2xl border border-slate-700 bg-slate-800/80 p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="h-4 w-20 rounded bg-slate-700" />
        <div className="h-6 w-24 rounded-full bg-slate-700" />
      </div>
      <div className="h-7 w-2/3 rounded bg-slate-700" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full rounded bg-slate-700" />
        <div className="h-4 w-5/6 rounded bg-slate-700" />
      </div>
      <div className="mt-6 flex gap-2">
        <div className="h-6 w-14 rounded bg-slate-700" />
        <div className="h-6 w-14 rounded bg-slate-700" />
      </div>
    </div>
  );
}
