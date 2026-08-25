"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Shield, Bell, Database, HardDrive } from "lucide-react";
import ProfileTab from "./components/ProfileTab";
import SecurityTab from "./components/SecurityTab";
import NotificationsTab from "./components/NotificationsTab";
import DataTab from "./components/DataTab";
import VaultTab from "./components/VaultTab";

const TABS = [
  { id: "profile", label: "Профиль", icon: User },
  { id: "security", label: "Безопасность", icon: Shield },
  { id: "notifications", label: "Уведомления", icon: Bell },
  { id: "data", label: "Данные", icon: Database },
  { id: "vault", label: "Защищённое хранилище", icon: HardDrive },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsHub() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get("tab");
  const active: TabId = TABS.some((t) => t.id === raw) ? (raw as TabId) : "profile";

  const setTab = (id: TabId) => router.replace(`/settings?tab=${id}`);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
        <p className="text-gray-600 mt-1">Профиль, безопасность, уведомления и ваши данные</p>
      </div>

      <div className="flex gap-1 border-b border-gray-100 mb-6 overflow-x-auto scrollbar-thin">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                isActive
                  ? "border-brand-500 text-brand-700"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {active === "profile" && <ProfileTab />}
      {active === "security" && <SecurityTab />}
      {active === "notifications" && <NotificationsTab />}
      {active === "data" && <DataTab />}
      {active === "vault" && <VaultTab />}
    </div>
  );
}