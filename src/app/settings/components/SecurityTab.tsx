"use client";
import { useState, FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { KeyRound, Lock, Loader2, LogOut, CheckCircle2 } from "lucide-react";

export default function SecurityTab() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password.length < 8) {
      setError("Пароль должен содержать не менее 8 символов");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
        return;
      }
      setSuccess(true);
      setPassword("");
      setConfirm("");
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
            <KeyRound className="w-4.5 h-4.5 text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Пароль</h3>
            <p className="text-sm text-gray-500">
              Установите или смените пароль для входа по email и паролю
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Новый пароль"
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 8 символов"
              autoComplete="new-password"
              disabled={busy}
            />
            <Input
              label="Повторите пароль"
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ещё раз"
              autoComplete="new-password"
              disabled={busy}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && (
            <p className="text-xs text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Пароль изменён. Теперь можно входить с email и паролем на странице входа.
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {busy ? "Сохранение…" : "Сменить пароль"}
          </Button>
        </form>
      </Card>

      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <LogOut className="w-4.5 h-4.5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Сеанс</h3>
            <p className="text-sm text-gray-500">Завершите текущий сеанс на этом устройстве</p>
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={handleSignOut}>
          <LogOut className="w-4 h-4" />
          Выйти из аккаунта
        </Button>
      </Card>

      <p className="text-xs text-gray-400 px-2">
        Вход по одноразовому коду остаётся доступным всегда. Пароль — ещё один способ входа,
        который не требует почты.
      </p>
    </div>
  );
}