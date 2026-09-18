"use client";
import { type FormEvent, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { KeyRound, Lock, Loader2, LogOut, CheckCircle2, ShieldCheck } from "lucide-react";

export default function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword) {
      setError("Введите текущий пароль");
      return;
    }
    if (password.length < 8) {
      setError("Новый пароль должен содержать не менее 8 символов");
      return;
    }
    if (password === currentPassword) {
      setError("Новый пароль не должен совпадать с текущим");
      return;
    }
    if (password !== confirm) {
      setError("Новые пароли не совпадают");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      if (!email) {
        setError("Не удалось определить email аккаунта");
        return;
      }

      const { error: verifyErr } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (verifyErr) {
        setError("Текущий пароль неверен");
        return;
      }

      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
        return;
      }
      setSuccess(true);
      setCurrentPassword("");
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
            <p className="text-sm text-gray-600">
              Установите или смените пароль для входа по email и паролю
            </p>
          </div>
        </div>

        <form onSubmit={(e) => { void handlePasswordChange(e); }} className="space-y-4">
          <Input
            label="Текущий пароль"
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Для подтверждения личности"
            autoComplete="current-password"
            disabled={busy}
          />
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
            <p className="text-sm text-gray-600">Завершите текущий сеанс на этом устройстве</p>
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={() => { void handleSignOut(); }}>
          <LogOut className="w-4 h-4" />
          Выйти из аккаунта
        </Button>
      </Card>

      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Двухфакторная аутентификация</h3>
            <p className="text-sm text-gray-600">
              Защитите аккаунт кодом из приложения-аутентификатора
            </p>
          </div>
        </div>
        <a
          href="/security"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ShieldCheck className="w-4 h-4" />
          Настроить 2FA на странице безопасности
        </a>
      </Card>

      <p className="text-xs text-gray-600 px-2">
        Вход по одноразовому коду остаётся доступным всегда. Пароль — ещё один способ входа,
        который не требует почты.
      </p>
    </div>
  );
}