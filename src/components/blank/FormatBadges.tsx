export default function FormatBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`flex gap-1.5 ${className}`}>
      <span className="inline-flex items-center rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-600">
        PDF
      </span>
      <span className="inline-flex items-center rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-600">
        Word
      </span>
    </div>
  );
}