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
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between text-left group"
        aria-expanded={!collapsed}
      >
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`} />
      </button>
      {!collapsed && <div className="mt-3">{children}</div>}
    </div>
  );
}
