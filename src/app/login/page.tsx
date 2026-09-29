import LoginClient, { type LoginClientProps } from "./login-client";

/**
 * Безопасный внутренний редирект. Проверяется на сервере, поэтому подделать
 * ?next=… на внешний домен нельзя (open redirect).
 */
function safeNext(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function readParam(v: string | string[] | undefined): string | null {
  return Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
}

/**
 * Страница входа/регистрации.
 *
 * Раньше это был клиентский компонент с useSearchParams() под <Suspense>.
 * Такой компонент выпадает из серверного рендеринга («CSR bailout»): в HTML
 * приходил пустой контейнер, и форма появлялась только после загрузки JS.
 * Теперь searchParams читаются здесь, на сервере, и передаются вниз
 * пропсами — форма сразу попадает в HTML и читается даже без JavaScript.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // Ключевая логика: /login без параметра — это ВХОД, а не регистрация.
  // Раньше дефолтом был «register», из-за чего постоянный пользователь
  // каждый раз попадал на форму «Создание аккаунта».
  const initialMode: "login" | "register" = readParam(sp.mode) === "register" ? "register" : "login";

  // ?error=oauth — редирект с /auth/callback при неудачном обмене кода OAuth.
  const errorCode = readParam(sp.error);
  const oauthError = errorCode
    ? errorCode === "no_code"
      ? "Не удалось завершить вход. Попробуйте ещё раз."
      : "Не удалось войти через выбранный сервис. Попробуйте ещё раз или войдите по email."
    : null;

  const props: LoginClientProps = {
    initialMode,
    next: safeNext(sp.next),
    oauthError,
    mfaRequested: readParam(sp.mfa) === "1",
  };

  return <LoginClient {...props} />;
}
