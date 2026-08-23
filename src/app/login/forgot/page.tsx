"use client";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import TurnstileCaptcha from "@/components/auth/TurnstileCaptcha";

function ForgotForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(undefined);

  const sendReset = async () => {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Введите корректный email");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/login/reset&type=recovery`,
      captchaToken,
    });
    setLoading(false);
    if (err) {
      setError(
        err.message.includes("rate limit") ||
          err.message.toLowerCase().includes("too many")
          ? "Слишком много запросов. Подождите минуту и попробуйте снова."
          : err.message
      );
      return;
    }
    setSent(true);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 mb-4">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Восстановление пароля
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            {sent
              ? "Проверьте почту — мы отправили ссылку для сброса пароля"
              : "Укажите email — пришлём ссылку для сброса пароля"}
          </p>
        </div>

        {sent ? (
          <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-sm text-emerald-800">
                Ссылка для сброса пароля отправлена на {email}
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Не пришло письмо? Проверьте папку «Спам» или попробуйте ещё раз
                через минуту.
              </p>
            </div>
          </div>
        ) : (
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
            <Button className="w-full mt-4" onClick={sendReset} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Отправить ссылку для сброса"
              )}
            </Button>
            <TurnstileCaptcha onToken={(t) => setCaptchaToken(t ?? undefined)} />
          </>
        )}

        <button
          className="w-full text-center text-sm text-gray-600 hover:text-brand-600 transition-colors mt-4"
          onClick={() => router.push("/login")}
        >
          ← Вернуться ко входу
        </button>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <Suspense fallback={null}>
        <ForgotForm />
      </Suspense>
    </div>
  );
}
