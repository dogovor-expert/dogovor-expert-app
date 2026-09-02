import { cn } from "@/lib/utils";
import { forwardRef, useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: "default" | "sharp" | "glass";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, variant = "default", id, ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "rounded-xl border-gray-200 focus:border-brand-500 focus:ring-brand-500/20",
      sharp: "rounded-none border-gray-300 focus:border-brand-500",
      glass: "rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40",
    };
    // Auto-generate id if not provided, чтобы aria-describedby всегда указывал
    // на существующий элемент (важно для скрин-ридеров и Lighthouse a11y).
    const autoId = useId();
    const inputId = id ?? autoId;
    const errorId = error ? `${inputId}-err` : undefined;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-describedby={props["aria-describedby"] ?? errorId}
          aria-invalid={error ? true : props["aria-invalid"]}
          className={cn(
            "block w-full px-4 py-2.5 text-sm transition-all duration-200 border bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed",
            variants[variant],
            error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
