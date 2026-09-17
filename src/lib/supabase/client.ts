import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseCookieOptions } from "./cookie-options";

// Синглтон: в приложении браузерный клиент создавался на каждый рендер
// (`const supabase = createClient()` в теле компонента). Несколько инстансов
// держат собственные копии сессии и авто-refresh-таймеры, из-за чего они
// перетирают cookie друг друга и сессию, обновлённую сервером/aal2 после 2FA.
let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Запасной вариант на этапе сборки / preview без прописанных env:
  // не падаем с исключением, а строим клиент-заглушку — реальные запросы
  // (auth и т.п.) будут корректно завершаться ошибкой в рантайме, но сборка
  // пройдёт, и сайт не «валится» целиком на форках/PR/превью без env.
  const finalUrl = url && url.length > 0 ? url : "https://placeholder.supabase.co";
  const finalKey = key && key.length > 0 ? key : "public-anon-placeholder-key";
  const client = createBrowserClient(finalUrl, finalKey, {
    cookieOptions: supabaseCookieOptions,
  });

  // Мемоизируем только в браузере: на сервере (SSR-пререндер) инстанс не нужен.
  if (typeof window !== "undefined") browserClient = client;
  return client;
}
