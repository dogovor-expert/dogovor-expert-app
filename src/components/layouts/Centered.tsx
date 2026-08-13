import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CenteredProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  className?: string;
  background?: "white" | "gradient" | "dark" | "sepia";
}

export function Centered({ children, maxWidth = "md", className, background = "white" }: CenteredProps) {
  const widths: Record<string, string> = {
    sm: "max-w-lg",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };
  const backgrounds: Record<string, string> = {
    white: "bg-white",
    gradient: "bg-gradient-to-br from-brand-50 to-white",
    dark: "bg-dark-900",
    sepia: "bg-sepia-50",
  };

  return (
    <div className={cn("min-h-screen flex flex-col", backgrounds[background])}>
      <header className="flex-shrink-0 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className={cn("mx-auto px-4 sm:px-6 h-16 flex items-center", widths[maxWidth])}>
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
            D
          </div>
        </div>
      </header>
      <main className={cn("flex-1 mx-auto px-4 sm:px-6 py-8 w-full", widths[maxWidth], className)}>
        {children}
      </main>
    </div>
  );
}
