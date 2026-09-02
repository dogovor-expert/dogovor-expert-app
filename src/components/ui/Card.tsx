import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass" | "flat" | "sharp";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "bg-white rounded-xl border border-gray-100 shadow-soft",
      elevated: "bg-white rounded-xl shadow-elevated border border-gray-50",
      glass: "glass rounded-xl",
      flat: "bg-white border-b border-gray-100 rounded-none",
      sharp: "bg-white border border-gray-200 rounded-sm",
    };
    const paddings: Record<string, string> = {
      none: "p-0", sm: "p-4", md: "p-6", lg: "p-8",
    };
    return (
      <div ref={ref} className={cn(variants[variant], paddings[padding], className)} {...props} />
    );
  }
);
Card.displayName = "Card";
