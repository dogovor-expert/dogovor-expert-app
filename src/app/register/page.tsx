import { redirect } from "next/navigation";

/**
 * `/register` исторически не существовал отдельной страницей — регистрация
 * живёт в `/login` (переключатель «Регистрация»). Старые ссылки и закладки на
 * `/register` отдавали 404, из-за чего вход выглядел сломанным. Теперь это
 * явный редирект в нужный режим формы.
 */
export default function RegisterRedirectPage() {
  redirect("/login?mode=register");
}
