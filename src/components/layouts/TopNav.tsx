import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TopNavProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  accentColor?: string;
  navLinks?: { label: string; href: string; active?: boolean }[];
  actions?: ReactNode;
}

export function TopNav({ children, title, subtitle, accentColor = "brand", navLinks, actions }: TopNavProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className={cn("border-b", `bg-${accentColor}-900 border-${accentColor}-800`)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold", `bg-${accentColor}-500`)}>
                D
              </div>
              <span className="font-semibold text-white">Dogovor.expert</span>
            </div>
            {navLinks && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    className={cn(
                      "px-4 py-2 text-sm rounded-lg transition-colors",
                      link.active
                        ? `bg-${accentColor}-800 text-white`
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      </header>
      {title && (
        <div className={cn("border-b", `bg-${accentColor}-800 border-${accentColor}-700`)}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {subtitle && <p className={cn("text-sm mt-1", `text-${accentColor}-200`)}>{subtitle}</p>}
          </div>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
