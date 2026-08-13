"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"link" | "password">("link");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setError(null);
    setInfo(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Введите корректный email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("code");
    setInfo(`Код отправлен на ${email}. Если в письме ссылка — нажмите её, вход выполнится автоматически.`);
  };

  const signInWithPassword = async () => {
    setError(null);
    setInfo(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Введите корректный email");
      return;
    }
    if (!password) {
      setError("Введите пароль");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message.includes("Invalid login credentials")
          ? "Неверный email или пароль. Пароль можно установить в Настройках → Безопасность."
          : error.message
      );
      return;
    }
    router.push(next);
    router.refresh();
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
      setError("Неверный или истёкший код. Попросите новый.");
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 mb-4">
            <Mail className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === "code"
              ? "Подтверждение кода"
              : mode === "link"
                ? "Вход в личный кабинет"
                : "Вход по паролю"}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {step === "code"
              ? "Введите 6 цифр из письма"
              : mode === "link"
                ? "Без пароля: пришлём одноразовый код на почту"
                : "Введите email и пароль"}
          </p>
        </div>

        {step === "email" && mode === "link" ? (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            <Button className="w-full mt-4" onClick={sendCode} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Создать мой первый договор →"
              )}
            </Button>
          </>
        ) : step === "email" && mode === "password" ? (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
              Пароль
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            <Button
              className="w-full mt-4"
              onClick={signInWithPassword}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Войти"}
            </Button>
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
              onClick={() => setStep("email")}
            >
              ← Изменить email
            </button>
          </>
        )}

        {step === "email" && (
          <button
            className="w-full text-center text-sm text-gray-500 hover:text-brand-600 transition-colors mt-4"
            onClick={() => setMode(mode === "link" ? "password" : "link")}
          >
            {mode === "link"
              ? "У меня есть пароль — войти с паролем"
              : "Войти по одноразовому коду без пароля"}
          </button>
        )}
      </Card>

      <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5" />
        Вход нужен только для тарифа Pro и биллинга — документы остаются в вашем браузере
      </p>
      <p className="text-center text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
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