"use client";
import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/**
 * Аудит Ф1: честное уведомление об отсутствии сети. Черновики и так
 * переживают offline (localStorage-первый дизайн), но пользователь должен
 * понимать, почему, например, не приходят уведомления или застыл статус
 * синхронизации.
 */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 bottom-20 md:bottom-5 z-[95] flex items-center gap-2 rounded-full bg-gray-900/95 text-white text-xs font-medium px-4 py-2 shadow-lg"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-300" aria-hidden />
      Нет соединения — черновики сохраняются локально, синхронизация продолжится автоматически
    </div>
  );
}
