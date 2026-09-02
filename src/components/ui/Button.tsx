import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const sizes = { sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5", md: "px-4 py-2 text-sm rounded-xl gap-2", lg: "px-6 py-3 text-base rounded-xl gap-2" };
    const variants: Record<string, string> = {
      primary: "bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-400 shadow-soft",
      secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400",
      ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-400",
      danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
      outline: "border-2 border-gray-200 text-gray-700 hover:border-brand-500 hover:text-brand-600 focus:ring-brand-400",
    };
    return (
      <button ref={ref} className={cn(base, sizes[size], variants[variant], className)} {...props} />
    );
  }
);
Button.displayName = "Button";
