import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SplitViewProps {
  left: ReactNode;
  right: ReactNode;
  ratio?: "50/50" | "60/40" | "70/30" | "40/60";
  leftHeader?: ReactNode;
  rightHeader?: ReactNode;
  className?: string;
}

export function SplitView({ left, right, ratio = "50/50", leftHeader, rightHeader, className }: SplitViewProps) {
  const ratios: Record<string, string> = {
    "50/50": "lg:grid-cols-2",
    "60/40": "lg:grid-cols-[3fr_2fr]",
    "70/30": "lg:grid-cols-[7fr_3fr]",
    "40/60": "lg:grid-cols-[2fr_3fr]",
  };

  return (
    <div className={cn("h-full grid grid-cols-1", ratios[ratio], className)}>
      <div className="flex flex-col min-h-0 border-r border-gray-200">
        {leftHeader && (
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-white">
            {leftHeader}
          </div>
        )}
        <div className="flex-1 overflow-auto p-6">
          {left}
        </div>
      </div>
      <div className="flex flex-col min-h-0">
        {rightHeader && (
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-white">
            {rightHeader}
          </div>
        )}
        <div className="flex-1 overflow-auto p-6">
          {right}
        </div>
      </div>
    </div>
  );
}
