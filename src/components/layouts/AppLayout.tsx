"use client";
import { ReactNode, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAllDrafts } from "@/lib/autosave";
import { createClient } from "@/lib/supabase/client";
import {
  FileText, Activity, Calculator,
  FolderOpen, Files, Trash2, CreditCard,
  Settings, HelpCircle, Menu, X, Bell, ChevronDown, Search, Shield, Home, LogIn, Cookie, Shuffle
} from "lucide-react";

interface NavItem {
  icon: ReactNode;
  label: string;
  href: string;
  badge?: string;
}

function getDraftCount(): number {
  try {
    return getAllDrafts().length;
  } catch {
    return 0;
  }
}

const toolNav: NavItem[] = [
  { icon: <Activity className="w-5 h-5" />, label: "Автотека", href: "/autoteka" },
  { icon: <Calculator className="w-5 h-5" />, label: "ОСАГО & КБМ", href: "/osago" },
  { icon: <Shuffle className="w-5 h-5" />, label: "Конвертер", href: "/converter" },
  { icon: <Calculator className="w-5 h-5" />, label: "Калькулятор", href: "/utils" },
];

const accountNav: NavItem[] = [
  { icon: <CreditCard className="w-5 h-5" />, label: "Биллинг", href: "/billing" },
  { icon: <Settings className="w-5 h-5" />, label: "Настройки", href: "/settings" },
  { icon: <HelpCircle className="w-5 h-5" />, label: "Помощь", href: "/help" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [draftCount, setDraftCount] = useState(0);
  const [profile, setProfile] = useState({ name: "Гость", initial: "Г", avatar: null as string | null });
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cookieConsent, setCookieConsent] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    try {
      setCookieConsent(localStorage.getItem("dogovor_cookie_consent"));
    } catch {
      setCookieConsent(null);
    }
  }, []);

  const acceptCookies = (value: string) => {
    try {
      localStorage.setItem("dogovor_cookie_consent", value);
    } catch {
      /* noop */
    }
    setCookieConsent(value);
  };

  const loadProfile = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUser(data.user);
      let name = data.user.email || "Пользователь";
      let avatar: string | null = null;
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const { data: profile } = await res.json();
          if (profile?.full_name) name = profile.full_name;
          if (profile?.avatar_url) avatar = profile.avatar_url;
        }
      } catch {
        // Fall back to session metadata
      }
      setProfile({
        name,
        initial: name.trim().charAt(0).toUpperCase() || "П",
        avatar,
      });
    } else {
      setUser(null);
      setProfile({ name: "Гость", initial: "Г", avatar: null });
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [pathname, loadProfile]);

  useEffect(() => {
    const onProfileUpdate = () => loadProfile();
    window.addEventListener("dogovor:profile", onProfileUpdate);
    return () => window.removeEventListener("dogovor:profile", onProfileUpdate);
  }, [loadProfile]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile({ name: "Гость", initial: "Г", avatar: null });
    window.location.href = "/";
  };

  const refreshDrafts = useCallback(() => {
    setDraftCount(getDraftCount());
  }, []);

  useEffect(() => {
    refreshDrafts();
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("dogovor_draft_")) refreshDrafts();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refreshDrafts);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refreshDrafts);
    };
  }, [refreshDrafts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    window.location.href = `/templates${q ? `?q=${encodeURIComponent(q)}` : ""}`;
  };

  const docNav: NavItem[] = [
    { icon: <FolderOpen className="w-5 h-5" />, label: "Мои документы", href: "/documents", badge: draftCount > 0 ? String(draftCount) : undefined },
    { icon: <Files className="w-5 h-5" />, label: "Каталог шаблонов", href: "/templates" },
    { icon: <Trash2 className="w-5 h-5" />, label: "Корзина", href: "/trash" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const renderNav = (items: NavItem[], title?: string) => (
    <div className="mb-4">
      {title && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">{title}</p>}
      {items.map((item, i) => {
        const active = isActive(item.href);
        return (
          <Link
            key={i}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5 ${
              active
                ? "bg-brand-50 text-brand-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto px-2 py-0.5 text-xs rounded-full font-medium bg-brand-100 text-brand-700">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 transform transition-transform duration-200 lg:relative lg:translate-x-0 flex flex-col ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              D
            </div>
            <span className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">Dogovor.fun</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-0.5 ${
              isActive("/") && pathname === "/"
                ? "bg-brand-50 text-brand-700"
                : "text-gray-800 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="w-5 h-5 flex items-center justify-center"><Home className="w-5 h-5" /></span>
            <span>Главная</span>
          </Link>
          <Link
            href="/builder"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-3 ${
              isActive("/builder")
                ? "bg-brand-50 text-brand-700"
                : "text-gray-800 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="w-5 h-5 flex items-center justify-center"><FileText className="w-5 h-5" /></span>
            <span>Создать документ</span>
          </Link>
          <div className="border-t border-gray-100 pt-4" />
          {renderNav(toolNav, "Инструменты")}
          <div className="border-t border-gray-100 pt-4 mb-4" />
          {renderNav(docNav, "Документы")}
          <div className="border-t border-gray-100 pt-4 mb-4" />
          {renderNav(accountNav, "Аккаунт")}
        </nav>

        <div className="flex-shrink-0 border-t border-gray-100 p-4">
          <Link
            href="/billing"
            className="flex items-center justify-between px-3 py-2.5 mb-2 rounded-xl bg-gradient-to-r from-brand-50 to-purple-50 hover:from-brand-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-brand-600" />
              <span className="text-xs font-medium text-brand-700">Бесплатный план</span>
            </div>
            {draftCount > 0 && (
              <span className="text-[10px] text-brand-500">{draftCount} док.</span>
            )}
          </Link>
          <div className="mt-3 px-3 py-2 bg-gradient-to-r from-brand-50 to-purple-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-brand-600" />
              <span className="text-[10px] font-medium text-brand-700">152-ФЗ, все данные в браузере</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 px-1">
            <Link href="/privacy" className="text-[11px] text-gray-400 hover:text-brand-600 transition-colors">Политика</Link>
            <Link href="/terms" className="text-[11px] text-gray-400 hover:text-brand-600 transition-colors">Соглашение</Link>
            <Link href="/about" className="text-[11px] text-gray-400 hover:text-brand-600 transition-colors">О сервисе</Link>
            <Link href="/contacts" className="text-[11px] text-gray-400 hover:text-brand-600 transition-colors">Контакты</Link>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <form onSubmit={handleSearchSubmit} className="relative max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск документов, шаблонов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </form>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button className="relative p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="relative group">
                  <Link href="/settings" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors" title={profile.name}>
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-xs font-medium text-white">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        profile.initial
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                  </Link>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-sm font-medium text-gray-900 truncate">{profile.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link href="/documents" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                      Мои документы
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl focus:ring-2 focus:ring-brand-400 focus:outline-none transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Войти
              </Link>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {cookieConsent === null && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-4.5 h-4.5 text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Мы используем cookies</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Обезличенные данные для анализа посещаемости и улучшения сервиса. Подробнее в{" "}
                <Link href="/privacy" className="text-brand-600 hover:underline">Политике конфиденциальности</Link>.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => acceptCookies("accepted")}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
                >
                  Принять
                </button>
                <button
                  onClick={() => acceptCookies("declined")}
                  className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Отклонить
                </button>
              </div>
            </div>
            <button onClick={() => acceptCookies("declined")} className="p-1 hover:bg-gray-100 rounded-lg flex-shrink-0" aria-label="Закрыть">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
