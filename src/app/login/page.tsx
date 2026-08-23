"use client";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, Loader2, Mail, ShieldCheck, Smartphone, Flame } from "lucide-react";
import Link from "next/link";
import type { Provider } from "@supabase/supabase-js";
import TurnstileCaptcha from "@/components/auth/TurnstileCaptcha";
import CountdownTimer from "@/components/billing/CountdownTimer";
import { currentProPrice, PRO_PRICE_OLD, PROMO_LABEL, isPromoActive, promoCountdownTarget, formatRub } from "@/lib/pricing";

function RegisterPromo() {
  if (!isPromoActive()) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-brand-50 border border-amber-200">
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-amber-400 text-amber-950 text-[10px] font-bold shrink-0">
        <Flame className="w-3 h-3" />
        {PROMO_LABEL}
      </span>
      <p className="text-xs text-gray-700 leading-snug">
        Акция для новых пользователей: PRO за{" "}
        <span className="font-bold">{formatRub(currentProPrice())}</span>{" "}
        <span className="text-gray-600 line-through">{formatRub(PRO_PRICE_OLD)}</span>/мес.
        Скидка закончится через{" "}
        <CountdownTimer endsAt={promoCountdownTarget()} compact className="font-bold tabular-nums" />
      </p>
    </div>
  );
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "Неверный email или пароль. Проверьте данные или восстановите пароль по ссылке ниже.";
  }
  if (m.includes("email not confirmed")) {
    return "Email не подтверждён. Отправьте себе код повторно — это подтвердит адрес и войдёт в аккаунт.";
  }
  if (m.includes("rate limit") || m.includes("too many") || m.includes("over_request")) {
    return "Слишком много запросов. Подождите минуту и попробуйте снова.";
  }
  if (m.includes("already registered")) {
    return "Этот email уже зарегистрирован. Попробуйте войти по паролю или восстановите его.";
  }
  if (m.includes("invalid token")) {
    return "Код недействителен. Запросите новый.";
  }
  if (m.includes("otp expired")) {
    return "Код истёк. Запросите новый.";
  }
  if (m.includes("invalid totp") || m.includes("factor") || m.includes("challenge")) {
    return "Неверный код. Проверьте цифры или подождите генерации нового кода.";
  }
  return message;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"register" | "login">("register");
  const [step, setStep] = useState<"email" | "password" | "confirm" | "code" | "mfa">("email");
  const [mfaFactor, setMfaFactor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<"google" | "custom:yandex" | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(undefined);

  // Если на /login пришли с ?mfa=1 (после OAuth/magic link), начинаем с шага 2FA.
  useEffect(() => {
    if (searchParams.get("mfa") !== "1" || step !== "email") return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp.find((f) => f.status === "verified");
      if (cancelled) return;
      if (verified) {
        setMfaFactor(verified.id);
        setStep("mfa");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, step]);

  const promptMfaIfNeeded = async (): Promise<boolean> => {
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp.find((f) => f.status === "verified");
    if (!verified) return false;
    setMfaFactor(verified.id);
    setStep("mfa");
    return true;
  };

  const verifyMfa = async () => {
    setError(null);
    if (!mfaFactor) {
      setError("Сессия 2FA недоступна. Запросите вход заново.");
      return;
    }
    if (code.trim().length < 6) {
      setError("Введите 6 цифр из приложения-аутентификатора");
      return;
    }
    setLoading(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: mfaFactor,
    });
    if (challengeError) {
      setLoading(false);
      setError(translateAuthError(challengeError.message));
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: mfaFactor,
      challengeId: challenge.id,
      code: code.trim(),
    });
    setLoading(false);
    if (error) {
      setError(translateAuthError(error.message));
      return;
    }
    router.push(next);
    router.refresh();
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const goToPasswordStep = () => {
    setError(null);
    if (!email) {
      setError("Введите email");
      return;
    }
    if (!validateEmail(email)) {
      setError("Введите корректный email (например: user@example.com)");
      return;
    }
    setStep("password");
  };

  const goToEmailStep = () => {
    setError(null);
    setPassword("");
    setPasswordConfirm("");
    setStep("email");
  };

  const registerUser = async () => {
    setError(null);
    setInfo(null);
    
    // Валидация email
    if (!email) {
      setError("Введите email");
      return;
    }
    if (!validateEmail(email)) {
      setError("Введите корректный email (например: user@example.com)");
      return;
    }
    
    // Валидация пароля
    if (!password) {
      setError("Введите пароль");
      return;
    }
    if (!validatePassword(password)) {
      setError("Пароль должен содержать минимум 8 символов");
      return;
    }
    
    // Валидация подтверждения пароля
    if (password !== passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }
    
    // Валидация чекбокса
    if (!agreed) {
      setError("Примите условия оферты, чтобы продолжить");
      return;
    }
    
    // Валидация Captcha
    if (!captchaToken) {
      setError("Пожалуйста, подтвердите, что вы не робот");
      return;
    }
    
    setLoading(true);
    
    try {
      // Регистрация пользователя
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          captchaToken,
        },
      });
      
      if (error) {
        setError(translateAuthError(error.message));
        return;
      }
      
      setStep("confirm");
      setInfo(`Регистрация почти завершена! На ваш email ${email} отправлено письмо с подтверждением. Проверьте папку "Входящие" или "Спам".`);
    } catch (err) {
      setError("Произошла ошибка при регистрации. Попробуйте позже.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithPassword = async () => {
    setError(null);
    setInfo(null);
    
    // Валидация email
    if (!email) {
      setError("Введите email");
      return;
    }
    if (!validateEmail(email)) {
      setError("Введите корректный email");
      return;
    }
    
    // Валидация пароля
    if (!password) {
      setError("Введите пароль");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setError(translateAuthError(error.message));
        return;
      }
      
      const needsMfa = await promptMfaIfNeeded();
      if (needsMfa) return;
      
      router.push(next);
      router.refresh();
    } catch (err) {
      setError("Произошла ошибка при входе. Попробуйте позже.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setError(null);
    if (code.trim().length < 6) {
      setError("Введите код из письма");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });
    setLoading(false);
    if (error) {
      setError(translateAuthError(error.message));
      return;
    }
    const needsMfa = await promptMfaIfNeeded();
    if (needsMfa) return;
    router.push(next);
    router.refresh();
  };

  const signInWithOAuth = async (provider: "google" | "custom:yandex") => {
    setError(null);
    setOauthBusy(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setOauthBusy(null);
    if (error) {
      setError(translateAuthError(error.message));
    }
  };

  const oauthBtnClass =
    "w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all hover:bg-gray-50";

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 mb-4">
            <Mail className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === "confirm"
              ? "Подтверждение регистрации"
              : step === "password"
                ? mode === "register"
                  ? "Создание аккаунта"
                  : "Вход по паролю"
                : step === "code"
                  ? "Подтверждение кода"
                  : step === "mfa"
                    ? "Подтвердите вход"
                    : mode === "register"
                      ? "Регистрация в личном кабинете"
                      : "Вход в личный кабинет"}
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            {step === "confirm"
              ? "Остался последний шаг"
              : step === "password"
                ? mode === "register"
                  ? "Придумайте пароль — он понадобится для входа"
                  : "Введите email и пароль"
                : step === "code"
                  ? "Введите 6 цифр из письма"
                  : step === "mfa"
                    ? "Введите код из приложения-аутентификатора"
                    : mode === "register"
                      ? "Создайте аккаунт для сохранения документов и доступа к Pro-тарифу"
                      : "Войдите в аккаунт для доступа к документам и Pro-тарифу"}
          </p>
        </div>

        {step === "email" && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => signInWithOAuth("google")}
                disabled={!!oauthBusy}
                className={`${oauthBtnClass} border-gray-200 text-gray-700 disabled:opacity-60`}
              >
                {oauthBusy === "google" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                Google
              </button>
              <button
                onClick={() => signInWithOAuth("custom:yandex")}
                disabled={!!oauthBusy}
                className={`${oauthBtnClass} border-gray-200 text-gray-700 disabled:opacity-60`}
              >
                {oauthBusy === "custom:yandex" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="12" fill="#FC3F1D" />
                    <path d="M13.78 5.5h-2.26c-2.7 0-4.02 1.52-4.02 3.5 0 1.6.84 2.7 2.4 3.42l-2.5 5.08h2.45l2.06-4.34h.45v4.34h2.2V5.5h.22zm-1.06 5.1h-.48c-1.34 0-2.13-.74-2.13-1.97 0-1.02.56-1.74 1.52-1.74h1.1v3.7h-.01z" fill="#fff" />
                  </svg>
                )}
                Яндекс
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-600">или по email</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
          </>
        )}

        {step === "email" && (mode === "register" || mode === "login") ? (
          <>
            {mode === "register" && <RegisterPromo />}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="you@example.com"
              autoComplete="email"
              onKeyDown={(e) => {
                if (e.key === "Enter") void goToPasswordStep();
              }}
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            <Button className="w-full mt-4" onClick={goToPasswordStep} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Продолжить →"
              )}
            </Button>
          </>
        ) : step === "password" ? (
          <>
            {mode === "register" ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Пароль
                  </label>
                  <button
                    className="text-xs text-brand-600 hover:underline"
                    onClick={goToEmailStep}
                  >
                    ← Изменить email
                  </button>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 8 символов"
                  autoComplete="new-password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void registerUser();
                  }}
                />
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                  Подтверждение пароля
                </label>
                <Input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Повторите пароль"
                  autoComplete="new-password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void registerUser();
                  }}
                />
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                <label className="flex items-start gap-2 mt-4 text-xs text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>
                    Я принимаю{" "}
                    <Link href="/terms" className="text-brand-600 hover:underline">
                      условия оферты
                    </Link>{" "}
                    и{" "}
                    <Link href="/privacy" className="text-brand-600 hover:underline">
                      политику конфиденциальности
                    </Link>
                  </span>
                </label>
                <TurnstileCaptcha onToken={(t) => setCaptchaToken(t ?? undefined)} />
                <div className="mt-4">
                  <RegisterPromo />
                </div>
                <Button className="w-full mt-4" onClick={registerUser} disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Зарегистрироваться"
                  )}
                </Button>
              </>
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void signInWithPassword();
                  }}
                />
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                <div className="text-right mt-2">
                  <Link
                    href="/login/forgot"
                    className="text-sm text-brand-600 hover:underline"
                  >
                    Забыли пароль?
                  </Link>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={signInWithPassword}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Войти"}
                </Button>
              </>
            )}
          </>
        ) : step === "mfa" ? (
          <>
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mx-auto mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-700 font-medium">Двухфакторная аутентификация</p>
              <p className="text-xs text-gray-600 mt-1">
                Введите 6 цифр из приложения-аутентификатора
              </p>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Код из приложения
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              inputMode="numeric"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") void verifyMfa();
              }}
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            <Button className="w-full mt-4" onClick={verifyMfa} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Подтвердить и войти"}
            </Button>
            <p className="text-xs text-gray-600 text-center mt-3">
              Код генерируется в приложении при каждом входе и действителен ~30 секунд
            </p>
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Код из письма
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              inputMode="numeric"
            />
            {info && (
              <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {info}
              </p>
            )}
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            <Button className="w-full mt-4" onClick={verifyCode} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Войти"}
            </Button>
            <button
              className="w-full text-center text-sm text-brand-600 hover:underline mt-3"
              onClick={() => {
                setStep("email");
                setAgreed(false);
              }}
            >
              ← Изменить email
            </button>
          </>
        )}

        {step === "confirm" && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-800">
              {info ?? "Проверьте ваш email и подтвердите регистрацию по ссылке из письма."}
            </p>
          </div>
        )}

        {step === "email" && (
          <button
            className="w-full text-center text-sm text-gray-600 hover:text-brand-600 transition-colors mt-4"
            onClick={() => {
              setMode(mode === "register" ? "login" : "register");
              setStep("email");
              setPassword("");
              setPasswordConfirm("");
              setAgreed(false);
              setError(null);
            }}
          >
            {mode === "register"
              ? "У меня уже есть аккаунт — войти"
              : "Нет аккаунта? Зарегистрироваться"}
          </button>
        )}

        {step === "password" && mode === "register" && (
          <p className="text-center text-xs text-gray-600 mt-3">
            После регистрации мы отправим письмо с подтверждением на ваш email
          </p>
        )}
      </Card>

      <p className="text-center text-xs text-gray-600 mt-4 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5" />
        Вход нужен только для тарифа Pro и биллинга — документы остаются в вашем браузере
      </p>
      <p className="text-center text-xs text-gray-600 mt-1 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5" />
        Бесплатно для создания черновиков · данные защищены (152-ФЗ)
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}