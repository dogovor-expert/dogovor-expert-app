import { redirect } from "next/navigation";

/**
 * `/register` исторически не существовал отдельной страницей — регистрация
 * живёт в `/login` (переключатель «Вход / Регистрация»). Старые ссылки и
 * закладки на `/register` отдавали 404, из-за чего вход выглядел сломанным.
 * Теперь это явный редирект в нужный режим формы.
 *
 * `?next=` пробрасывается, чтобы после регистрации человек вернулся туда,
 * откуда пришёл (например, к оплате AI-юриста), а не на пустой кабинет.
 * Значение санитизируется — допускаются только внутренние пути, поэтому
 * подделать редирект на внешний домен невозможно.
 */
function safeNext(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}

export default async function RegisterRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  redirect(`/login?mode=register${next ? `&next=${encodeURIComponent(next)}` : ""}`);
}
