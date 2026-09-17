"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  Package,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Shield,
  ScrollText,
  Search,
  Headphones,
  BarChart3,
  PlaySquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { atLeast, ROLE_LABELS, type AdminRole } from "@/lib/admin-rbac";

const NAV: { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; minRole?: AdminRole }[] = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Пользователи", icon: Users, minRole: "admin" },
  { href: "/admin/subscriptions", label: "Подписки", icon: CreditCard, minRole: "admin" },
  { href: "/admin/payments", label: "Платежи", icon: Receipt, minRole: "admin" },
  { href: "/admin/analytics", label: "Аналитика", icon: BarChart3, minRole: "admin" },
  { href: "/admin/replays", label: "Записи визитов", icon: PlaySquare, minRole: "admin" },
  { href: "/admin/leads", label: "Лиды (растаможка)", icon: Package },
  { href: "/admin/feedback", label: "Обратная связь", icon: MessageSquare },
  { href: "/admin/chat", label: "Чат поддержки", icon: Headphones },
  { href: "/admin/audit", label: "Журнал действий", icon: ScrollText, minRole: "admin" },
];

export default function AdminShell({
  userEmail,
  role = "admin",
  children,
}: {
  userEmail: string;
  /** 6.5 RBAC: роль текущего админа — фильтр навигации + бейдж. */
  role?: AdminRole;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const nav = NAV.filter((item) => !item.minRole || atLeast(role, item.minRole));

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-200 lg:relative lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800 flex-shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
              D
            </div>
            <span className="font-semibold text-white">Админ-панель</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden p-2.5 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-shrink-0 border-t border-slate-800 p-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Shield className="w-4 h-4" />
            Вернуться на сайт
          </Link>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2.5 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim();
                if (q) {
                  sessionStorage.setItem("admin_search_q", q);
                  router.push("/admin/search");
                }
              }}
              className="relative hidden sm:block"
            >
              <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                name="q"
                placeholder="Глобальный поиск…"
                aria-label="Глобальный поиск"
                className="w-64 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </form>
            <span className="text-sm text-gray-600 hidden lg:inline">Dogovor.expert · управление</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:inline">{userEmail}</span>
            <span
              className="hidden sm:inline-flex items-center rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700"
              title="Ваша роль в админке"
            >
              {ROLE_LABELS[role]}
            </span>
            <button
              onClick={() => void handleLogout()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
