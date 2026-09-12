export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-start justify-center pt-16 px-4" role="status" aria-live="polite">
      <span className="sr-only">Загрузка…</span>
      <div className="w-full max-w-3xl space-y-4 animate-pulse" aria-hidden>
        <div className="h-8 w-2/5 rounded-xl bg-gray-200/80" />
        <div className="h-4 w-3/5 rounded-lg bg-gray-200/60" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl border border-gray-100 bg-gray-50" />
          ))}
        </div>
      </div>
    </div>
  );
}
