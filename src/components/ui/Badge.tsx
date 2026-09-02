import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "blue" | "green" | "amber" | "red" | "purple" | "gray" | "teal" | "pink";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "gray", size = "sm", dot, ...props }, ref) => {
    const variants: Record<string, string> = {
      blue: "bg-brand-50 text-brand-700 border-brand-200",
      green: "bg-emerald-50 text-emerald-700 border-emerald-200",
      amber: "bg-yellow-50 text-yellow-700 border-yellow-200",
      red: "bg-red-50 text-red-700 border-red-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      gray: "bg-gray-100 text-gray-700 border-gray-200",
      teal: "bg-teal-50 text-teal-700 border-teal-200",
      pink: "bg-pink-50 text-pink-700 border-pink-200",
    };
    const sizes: Record<string, string> = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
    };
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 font-medium rounded-full border",
          sizes[size], variants[variant], className
        )}
        {...props}
      >
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
        {props.children}
      </span>
    );
  }
);
Badge.displayName = "Badge";
