"use client";
import { useState, useEffect, useCallback, type ReactNode } from "react";
import type { User } from "@supabase/auth-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAllDrafts } from "@/lib/autosave";
import { createClient } from "@/lib/supabase/client";
import { restoreSessionFromCookie } from "@/lib/auth/bootstrap";
import {
  FileText, Activity, Calculator,
  FolderOpen, Files, Trash2, CreditCard,
  Settings, HelpCircle, Menu, X, ChevronDown, Shield, Home, LogIn, Shuffle, Newspaper, Car, GitCompare,
  HardDrive, Download, Cookie, Moon, Sun
} from "lucide-react";
import HeaderSearch from "@/components/search/HeaderSearch";
import { CookieBanner } from "@/components/cookie/CookieBanner";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { useSidebarTheme } from "@/lib/hooks/useSidebarTheme";
import PromoPill from "@/components/billing/PromoPill";
import SupportLauncher from "@/components/support/SupportLauncher";
import NotificationBell from "@/components/layout/NotificationBell";
import OfflineBanner from "@/components/layout/OfflineBanner";
import MobileTabBar from "@/components/layouts/MobileTabBar";

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
  { icon: <FileText className="w-5 h-5" />, label: "Конструктор резюме", href: "/resume" },
  { icon: <Car className="w-5 h-5" />, label: "Выписка ЭПТС", href: "/epts" },
  { icon: <Activity className="w-5 h-5" />, label: "Проверка авто", href: "/autoteka" },
  { icon: <Calculator className="w-5 h-5" />, label: "ОСАГО", href: "/osago" },
  { icon: <Shuffle className="w-5 h-5" />, label: "Конвертер документов", href: "/converter" },
  { icon: <Calculator className="w-5 h-5" />, label: "Калькуляторы", href: "/utils" },
  { icon: <GitCompare className="w-5 h-5" />, label: "Сравнение договоров", href: "/sravnenie-dogovorov" },
];

const accountNav: NavItem[] = [
  { icon: <CreditCard className="w-5 h-5" />, label: "Биллинг", href: "/billing" },
  { icon: <Settings className="w-5 h-5" />, label: "Настройки", href: "/settings" },
  { icon: <HardDrive className="w-5 h-5" />, label: "Облачные диски", href: "/connections" },
  { icon: <HelpCircle className="w-5 h-5" />, label: "Помощь", href: "/help" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [draftCount, setDraftCount] = useState(0);
  const [profile, setProfile] = useState({ name: "Гость", initial: "Г", avatar: null as string | null });
  const [user, setUser] = useState<User | null>(null);
  const [profileVersion, setProfileVersion] = useState(0);
  // Иконка cookies переехала в хедер рядом с колокольчиком, чтобы не
  // перекрывать SupportLauncher (fixed bottom-right). Внешний флаг управляет
  // панелью настроек в CookieBanner.
  const [cookieSettingsOpen, setCookieSettingsOpen] = useState(false);
  // Cookies-иконка показывается в хедере только после получения согласия
  // (до этого есть first-visit баннер снизу).
  const { isReady: cookieReady } = useCookieConsent();
  const showCookieIcon = cookieReady;
  const { isDark: sidebarDark, toggle: toggleSidebarTheme } = useSidebarTheme();
  const pathname = usePathname();
  // Cookies-баннер вынесен в <CookieBanner/>: использует useSyncExternalStore,
  // не зависит от pathname, не пересоздаётся при навигации, не дёргает setState
  // в AppLayout. Это устраняет FOUC и race с loadProfile().

  const loadProfile = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user ?? null;
    setUser(sessionUser);
    if (!sessionUser) {
      setProfile({ name: "Гость", initial: "Г", avatar: null });
      return;
    }
  }, []);

  // Аутентификация: только синхронное обновление состояния в onAuthStateChange.
  // НИКАКИХ await supabase внутри колбэка — это вызывает deadlock клиента
  // (supabase/auth-js#762). Профиль тянется отдельным эффектом ниже.
  useEffect(() => {
    void loadProfile();
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (!sessionUser) setProfile({ name: "Гость", initial: "Г", avatar: null });
      else setProfileVersion((v) => v + 1);
    });
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // «Призрачная сессия» (Opera/мобильные браузеры чистят localStorage, но
  // оставляют cookie): middleware пускает в /dashboard, а хедер показывает
  // «Войти» и /login отбивается редиректом — цикл без формы входа. Чиним на
  // старте: поднимаем клиентскую сессию из cookie либо сбрасываем протухшую.
  useEffect(() => {
    void restoreSessionFromCookie();
  }, []);

  // Загрузка профиля: только при смене user.id (и после внешних событий
  // dogovor:profile). AbortController + ignore флаг против гонок и
  // отмены уже неактуальных запросов при быстрой навигации.
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    let ignore = false;

    const initialName = user.email || "Пользователь";
    setProfile({ name: initialName, initial: initialName.trim().charAt(0).toUpperCase() || "П", avatar: null });

    void (async () => {
      try {
        const res = await fetch("/api/profile", { signal: controller.signal });
        if (!res.ok) return;
        const { data: p } = (await res.json()) as { data?: { full_name?: string; avatar_url?: string } };
        if (ignore) return;
        const name = p?.full_name || initialName;
        setProfile({
          name,
          initial: name.trim().charAt(0).toUpperCase() || "П",
          avatar: p?.avatar_url ?? null,
        });
      } catch {
        // Abort (навигация/последующая загрузка) или сетевой сбой — fallback уже установлен
      }
    })();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [user, profileVersion]);

  // Внешние события `dogovor:profile` (например, после смены имени в настройках)
  // заставляют перезапросить профиль.
  useEffect(() => {
    const onProfileUpdate = () => setProfileVersion((v) => v + 1);
    window.addEventListener("dogovor:profile", onProfileUpdate);
    return () => window.removeEventListener("dogovor:profile", onProfileUpdate);
  }, []);

  // Мобильный сайдбар = модальная поверхность: блокируем скролл body пока
  // открыт (иначе под автораем прокручивается контент, на iOS — bouncing),
  // закрываем по Escape.
  useEffect(() => {
    if (!open) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

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

  const docNav: NavItem[] = [
    { icon: <FolderOpen className="w-5 h-5" />, label: "Мои документы", href: "/documents", badge: draftCount > 0 ? String(draftCount) : undefined },
    { icon: <Files className="w-5 h-5" />, label: "Каталог шаблонов", href: "/templates" },
    { icon: <Download className="w-5 h-5" />, label: "Бланки", href: "/blanks" },
    { icon: <Trash2 className="w-5 h-5" />, label: "Корзина", href: "/trash" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const renderNav = (items: NavItem[], title?: string) => (
    <div className="mb-4">
      {title && <p className={`text-[10px] font-bold uppercase tracking-widest px-3 mb-2 ${sidebarDark ? "text-slate-500" : "text-slate-600"}`}>{title}</p>}
      {items.map((item, i) => {
        const active = isActive(item.href);
        return (
          <Link
            key={i}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5 ${
              active
                ? sidebarDark
                  ? "bg-brand-500/20 text-brand-300"
                  : "bg-brand-50 text-brand-700"
                : sidebarDark
                  ? "text-slate-400 hover:bg-white/5 hover:text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && (
              <span className={`ml-auto px-2 py-0.5 text-xs rounded-full font-medium ${sidebarDark ? "bg-brand-500/25 text-brand-200" : "bg-brand-100 text-brand-700"}`}>
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  // Для админки свой интерфейс (admin/layout.tsx) — не показываем сайтовый chrome.
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar: on mobile it is removed from DOM when closed (hidden) to avoid horizontal overflow; on desktop it is always in flow */}
      <aside className={`z-30 w-64 flex flex-col border-r ${
        sidebarDark ? "bg-dark-900 border-dark-800" : "bg-white border-gray-100"
      } ${
        open
          ? "fixed inset-y-0 left-0 shadow-xl lg:static lg:shadow-none"
          : "hidden lg:flex lg:static"
      }`}>
        <div className={`flex items-center justify-between h-16 px-6 border-b flex-shrink-0 ${sidebarDark ? "border-dark-800" : "border-gray-100"}`}>
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              D
            </div>
            <span className={`font-semibold group-hover:text-brand-500 transition-colors ${sidebarDark ? "text-white" : "text-gray-900"}`}>Dogovor.expert</span>
          </Link>
          <button onClick={() => setOpen(false)} className={`lg:hidden p-2.5 rounded-lg ${sidebarDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`} aria-label="Закрыть меню навигации">
            <X className={`w-5 h-5 ${sidebarDark ? "text-slate-300" : "text-gray-600"}`} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-0.5 ${
              isActive("/") && pathname === "/"
                ? sidebarDark ? "bg-brand-500/20 text-brand-300" : "bg-brand-50 text-brand-700"
                : sidebarDark ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-gray-800 hover:bg-gray-50 hover:text-gray-900"
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
                ? sidebarDark ? "bg-brand-500/20 text-brand-300" : "bg-brand-50 text-brand-700"
                : sidebarDark ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-gray-800 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="w-5 h-5 flex items-center justify-center"><FileText className="w-5 h-5" /></span>
            <span>Создать документ</span>
          </Link>
          <Link
            href="/blog"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-3 ${
              isActive("/blog")
                ? sidebarDark ? "bg-brand-500/20 text-brand-300" : "bg-brand-50 text-brand-700"
                : sidebarDark ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-gray-800 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="w-5 h-5 flex items-center justify-center"><Newspaper className="w-5 h-5" /></span>
            <span>Блог</span>
          </Link>
          <div className={`border-t pt-4 ${sidebarDark ? "border-dark-800" : "border-gray-100"}`} />
          {renderNav(toolNav, "Инструменты")}
          <div className={`border-t pt-4 mb-4 ${sidebarDark ? "border-dark-800" : "border-gray-100"}`} />
          {renderNav(docNav, "Документы")}
          <div className={`border-t pt-4 mb-4 ${sidebarDark ? "border-dark-800" : "border-gray-100"}`} />
          {renderNav(accountNav, "Аккаунт")}
        </nav>

        <div className={`flex-shrink-0 border-t p-4 ${sidebarDark ? "border-dark-800" : "border-gray-100"}`}>
          <button
            type="button"
            onClick={toggleSidebarTheme}
            aria-label={sidebarDark ? "Светлая тема меню" : "Тёмная тема меню"}
            title={sidebarDark ? "Светлая тема меню" : "Тёмная тема меню"}
            className={`w-full flex items-center justify-between px-3 py-2.5 mb-2 rounded-xl text-xs font-medium transition-colors ${
              sidebarDark
                ? "bg-white/5 text-slate-300 hover:bg-white/10"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center gap-2">
              {sidebarDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {sidebarDark ? "Светлое меню" : "Тёмное меню"}
            </span>
            <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${sidebarDark ? "bg-brand-500" : "bg-gray-300"}`}>
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${sidebarDark ? "translate-x-3.5" : "translate-x-0.5"}`} />
            </span>
          </button>
          <Link
            href="/billing"
            className={`flex items-center justify-between px-3 py-2.5 mb-2 rounded-xl transition-colors ${
              sidebarDark
                ? "bg-gradient-to-r from-brand-500/15 to-purple-500/15 hover:from-brand-500/25"
                : "bg-gradient-to-r from-brand-50 to-purple-50 hover:from-brand-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className={`w-3.5 h-3.5 ${sidebarDark ? "text-brand-300" : "text-brand-600"}`} />
              <span className={`text-xs font-medium ${sidebarDark ? "text-brand-200" : "text-brand-700"}`}>Бесплатный план</span>
            </div>
            {draftCount > 0 && (
              <span className={`text-[10px] ${sidebarDark ? "text-brand-300" : "text-brand-500"}`}>{draftCount} док.</span>
            )}
          </Link>
          <div className={`mt-3 px-3 py-2 rounded-xl bg-gradient-to-r ${sidebarDark ? "from-brand-500/15 to-purple-500/15" : "from-brand-50 to-purple-50"}`}>
            <div className="flex items-center gap-2">
              <Shield className={`w-3.5 h-3.5 ${sidebarDark ? "text-brand-300" : "text-brand-600"}`} />
              <span className={`text-[10px] font-medium ${sidebarDark ? "text-brand-200" : "text-brand-700"}`}>152-ФЗ · документы в браузере, OCR — по согласию</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 px-1">
            {[
              ["/privacy", "Политика"],
              ["/terms", "Соглашение"],
              ["/about", "О сервисе"],
              ["/legal/trademark", "Товарный знак"],
              ["/contacts", "Контакты"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={`text-[11px] leading-6 underline underline-offset-2 hover:no-underline transition-colors ${
                  sidebarDark ? "text-slate-400 hover:text-white" : "text-gray-600 hover:text-brand-600"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
          <p className={`mt-2 px-1 text-[10px] leading-4 ${sidebarDark ? "text-slate-500" : "text-gray-500"}`}>
            © 2024–{new Date().getFullYear()} Dogovor-Эксперт™. Все права защищены.
          </p>
        </div>
      </aside>

      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden touch-none" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 gap-4 flex-shrink-0 max-w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2.5 hover:bg-gray-100 rounded-lg" aria-label="Открыть меню навигации">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <HeaderSearch />
            <PromoPill />
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {showCookieIcon && (
                  <button
                    type="button"
                    onClick={() => setCookieSettingsOpen(true)}
                    aria-label="Настройки cookies"
                    title="Настройки cookies"
                    className="p-2.5 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors motion-reduce:transition-none"
                  >
                    <Cookie className="w-5 h-5 text-gray-600" aria-hidden />
                  </button>
                )}
                <NotificationBell />
                <div className="relative group">
                  <Link href="/settings" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors" title={profile.name}>
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-xs font-medium text-white">
                      {profile.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element -- аватар приходит из Supabase Storage/Google/Yandex (внешний URL), remotePatterns уже настроены
                        <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        profile.initial
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
                  </Link>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-sm font-medium text-gray-900 truncate">{profile.name}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    </div>
                    <Link href="/documents" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                      Мои документы
                    </Link>
                    <button
                      onClick={() => void handleSignOut()}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {showCookieIcon && (
                  <button
                    type="button"
                    onClick={() => setCookieSettingsOpen(true)}
                    aria-label="Настройки cookies"
                    title="Настройки cookies"
                    className="p-2.5 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors motion-reduce:transition-none"
                  >
                    <Cookie className="w-5 h-5 text-gray-600" aria-hidden />
                  </button>
                )}
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl focus:ring-2 focus:ring-brand-400 focus:outline-none transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Войти
                </Link>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto max-w-full px-4 sm:px-6 lg:px-8 pb-28 lg:pb-0" tabIndex={0}>
  <div className="max-w-7xl mx-auto w-full">{children}</div>
</main>
      </div>

      {/* SupportLauncher появляется только когда юзер сделал выбор
          (cookieReady === true). CookieBanner сам управляет видимостью
          и не зависит от состояния AppLayout. */}
      <OfflineBanner />
      {cookieReady && <SupportLauncher />}
      <CookieBanner
        settingsOpenExternal={cookieSettingsOpen}
        onSettingsClosed={() => setCookieSettingsOpen(false)}
      />
      <MobileTabBar />
    </div>
  );
}
