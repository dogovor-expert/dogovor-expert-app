import { createBrowserClient } from "@supabase/ssr";
import { supabaseCookieOptions } from "./cookie-options";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Запасной вариант на этапе сборки / preview без прописанных env:
  // не падаем с исключением, а строим клиент-заглушку — реальные запросы
  // (auth и т.п.) будут корректно завершаться ошибкой в рантайме, но сборка
  // пройдёт, и сайт не «валится» целиком на форках/PR/превью без env.
  const finalUrl = url && url.length > 0 ? url : "https://placeholder.supabase.co";
  const finalKey = key && key.length > 0 ? key : "public-anon-placeholder-key";
  return createBrowserClient(finalUrl, finalKey, {
    cookieOptions: supabaseCookieOptions,
  });
}
