import { cn } from "@/lib/utils";
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  variant?: "default" | "striped" | "bordered" | "minimal";
}

export function Table({ className, variant = "default", ...props }: TableProps) {
  const variants: Record<string, string> = {
    default: "divide-y divide-gray-100",
    striped: "divide-y divide-gray-100 [&_tr:nth-child(even)]:bg-gray-50",
    bordered: "border border-gray-200 [&_td]:border [&_td]:border-gray-100 [&_th]:border [&_th]:border-gray-100",
    minimal: "divide-y divide-gray-50",
  };
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full text-sm", variants[variant], className)} {...props} />
    </div>
  );
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-gray-50 text-left", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-gray-100", className)} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("transition-colors hover:bg-gray-50/50", className)} {...props} />;
}

export function TableHeader({ className, ...props }: ThHTMLAttributes<HTMLTableHeaderCellElement>) {
  return (
    <th
      className={cn("px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableDataCellElement>) {
  return <td className={cn("px-4 py-3 text-gray-700", className)} {...props} />;
}
