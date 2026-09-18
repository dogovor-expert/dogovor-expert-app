"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const next = typeof nextParam === "string" ? nextParam : "/dashboard";
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError(
          "Ссылка недействительна или истекла. Запросите ссылку для сброса пароля заново."
        );
      }
    })();
  }, [supabase]);

  const savePassword = async () => {
    setError(null);
    if (password.length < 8) {
      setError("Пароль должен содержать не менее 8 символов");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(
        err.message.includes("same password")
          ? "Новый пароль должен отличаться от текущего."
          : err.message
      );
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push(next);
      router.refresh();
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 mb-4">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Новый пароль
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Придумайте новый пароль для входа
          </p>
        </div>

        {done ? (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-emerald-800">
              Пароль изменён. Выполняем вход…
            </p>
          </div>
        ) : (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Новый пароль
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 8 символов"
              autoComplete="new-password"
            />
            <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
              Повторите пароль
            </label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ещё раз"
              autoComplete="new-password"
            />
            {error && (
              <p className="text-sm text-red-600 mt-2 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </p>
            )}
            {!error && !done && (
              <button
                className="w-full text-center text-sm text-brand-600 hover:underline mt-3"
                onClick={() => router.push("/login/forgot")}
              >
                Запросить новую ссылку
              </button>
            )}
            <Button
              className="w-full mt-4"
              onClick={() => { void savePassword(); }}
              disabled={loading || !!error}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Сохранить пароль"
              )}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </div>
  );
}