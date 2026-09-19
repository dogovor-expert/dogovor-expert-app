import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateAction {
  label: string;
  href: string;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  secondary?: EmptyStateAction;
  steps?: string[];
  compact?: boolean;
  bare?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondary,
  steps,
  compact = false,
  bare = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        !bare && "rounded-3xl border border-gray-200 bg-white shadow-soft",
        compact ? "px-6 py-8" : "px-6 py-12 sm:px-10 sm:py-14",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(360px_180px_at_50%_0%,rgba(37,99,235,0.07),transparent_70%)]" />
      <div className="relative mx-auto flex max-w-md flex-col items-center text-center">
        <div
          className={cn(
            "grid place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-glow",
            compact ? "h-12 w-12" : "h-14 w-14"
          )}
        >
          <Icon className={compact ? "h-6 w-6" : "h-7 w-7"} />
        </div>
        <h3 className={cn("mt-4 font-bold text-gray-900", compact ? "text-base" : "text-lg")}>
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{description}</p>

        {steps && steps.length > 0 && (
          <ol className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {steps.map((s, i) => (
              <li
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-slate-50 px-3 py-1 text-xs font-medium text-gray-700"
              >
                <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        )}

        {(action || secondary) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {action && (
              <Link
                href={action.href}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg active:scale-[0.98]"
              >
                {action.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {secondary && (
              <Link
                href={secondary.href}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-300 hover:text-brand-700"
              >
                {secondary.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmptyState;
