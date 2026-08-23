import { ChevronDown } from "lucide-react";

interface CollapsibleProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  collapsed: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

export default function Collapsible({
  id,
  title,
  icon,
  collapsed,
  onToggle,
  children,
}: CollapsibleProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-soft overflow-hidden">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between text-left px-4 py-3.5 group hover:bg-slate-50/60 transition-colors"
        aria-expanded={!collapsed}
      >
        <h3 className="flex items-center gap-2.5 text-[15px] font-bold text-slate-800">
          {icon && (
            <span className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              {icon}
            </span>
          )}
          {title}
        </h3>
        <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`} />
      </button>
      {!collapsed && <div className="px-4 pb-4 pt-0.5">{children}</div>}
    </div>
  );
}
