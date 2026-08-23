"use client";
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import {
  KeyRound,
  Loader2,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  LogOut,
} from "lucide-react";

function translateMfaError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid")) return "Неверный код. Проверьте цифры и попробуйте снова.";
  if (m.includes("expired") || m.includes("timeout")) return "Код устарел. Запросите новый.";
  if (m.includes("not found") || m.includes("factor")) return "Фактор не найден. Обновите страницу.";
  return message;
}

export default function SecurityPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({ newPass: "", confirm: "" });
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordDone, setPasswordDone] = useState(false);

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [enrollBusy, setEnrollBusy] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadFactors = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp.find((f) => f.status === "verified");
    setFactorId(verified?.id ?? null);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadFactors();
  }, [loadFactors]);

  const handlePasswordChange = async () => {
    setPasswordDone(false);
    if (passwordForm.newPass.length < 8) {
      showToast("Пароль должен содержать не менее 8 символов");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      showToast("Пароли не совпадают");
      return;
    }
    setPasswordBusy(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPass });
    setPasswordBusy(false);
    if (error) {
      showToast(error.message);
      return;
    }
    setPasswordForm({ newPass: "", confirm: "" });
    setPasswordDone(true);
  };

  const handleEnable = async () => {
    setEnrollError(null);
    setEnrollBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setEnrollBusy(false);
    if (error || !data) {
      setEnrollError(error?.message ?? "Не удалось начать настройку");
      return;
    }
    setPendingFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
  };

  const handleConfirmEnroll = async () => {
    setEnrollError(null);
    if (!pendingFactorId || otpCode.length < 6) {
      setEnrollError("Введите 6 цифр из приложения");
      return;
    }
    setEnrollBusy(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: pendingFactorId,
    });
    if (challengeError || !challenge) {
      setEnrollBusy(false);
      setEnrollError(translateMfaError(challengeError?.message ?? "Ошибка"));
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: pendingFactorId,
      challengeId: challenge.id,
      code: otpCode,
    });
    setEnrollBusy(false);
    if (verifyError) {
      setEnrollError(translateMfaError(verifyError.message));
      return;
    }
    await supabase.auth.updateUser({ data: { mfa_enabled: true } });
    setPendingFactorId(null);
    setQrCode(null);
    setSecret(null);
    setOtpCode("");
    await loadFactors();
    showToast("Двухфакторная аутентификация включена");
  };

  const handleDisable = async () => {
    if (!factorId) return;
    setEnrollBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setEnrollBusy(false);
    if (error) {
      setEnrollError(translateMfaError(error.message));
      return;
    }
    await supabase.auth.updateUser({ data: { mfa_enabled: false } });
    setFactorId(null);
    showToast("Двухфакторная аутентификация отключена");
  };

  const handleSignOutAll = async () => {
    await supabase.auth.signOut({ scope: "global" });
    window.location.href = "/login";
  };

  const copySecret = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Не удалось скопировать — скопируйте секрет вручную");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Безопасность</h1>
          <p className="text-gray-600 text-sm">Пароль, двухфакторная аутентификация и сеансы</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card variant="default" padding="md">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-brand-600" />
            Изменить пароль
          </h2>
          {passwordDone && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              Пароль успешно изменён
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Новый пароль</label>
              <Input
                type="password"
                value={passwordForm.newPass}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))}
                placeholder="Минимум 8 символов"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Подтвердите пароль</label>
              <Input
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="Повторите новый пароль"
                autoComplete="new-password"
              />
            </div>
            <Button variant="primary" size="sm" onClick={handlePasswordChange} disabled={passwordBusy}>
              {passwordBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Сохранить пароль
            </Button>
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-brand-600" />
              Двухфакторная аутентификация
            </h2>
            {!loading && (factorId ? (
              <Badge variant="green" size="sm" dot>Включена</Badge>
            ) : (
              <Badge variant="gray" size="sm">Выключена</Badge>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
            </div>
          ) : factorId ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                При входе потребуется 6-значный код из приложения-аутентификатора (Google Authenticator, Authy и другие).
              </p>
              <Button variant="danger" size="sm" onClick={handleDisable} disabled={enrollBusy}>
                {enrollBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
                Отключить 2FA
              </Button>
            </div>
          ) : qrCode ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Отсканируйте QR-код приложением-аутентификатором или введите секрет вручную, затем введите 6-значный код.
              </p>
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode} alt="QR-код для настройки 2FA" className="w-48 h-48 rounded-xl border border-gray-200" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-mono text-sm text-gray-700 break-all pr-2">{secret}</span>
                <button
                  onClick={copySecret}
                  className="shrink-0 inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Скопировано" : "Копировать"}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Код из приложения</label>
                <Input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••"
                  inputMode="numeric"
                />
              </div>
              {enrollError && <p className="text-sm text-red-600">{enrollError}</p>}
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={handleConfirmEnroll} disabled={enrollBusy}>
                  {enrollBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Подтвердить и включить
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (pendingFactorId) void supabase.auth.mfa.unenroll({ factorId: pendingFactorId });
                    setPendingFactorId(null);
                    setQrCode(null);
                    setSecret(null);
                    setEnrollError(null);
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Двухфакторная аутентификация защищает аккаунт: даже если пароль или код из письма станут известны,
                войти без кода из вашего приложения не получится.
              </p>
              <Button variant="primary" size="sm" onClick={handleEnable} disabled={enrollBusy}>
                {enrollBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Включить 2FA
              </Button>
            </div>
          )}
        </Card>
      </div>

      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <LogOut className="w-5 h-5 text-brand-600" />
            Сеансы
          </h2>
          <Button variant="ghost" size="sm" onClick={handleSignOutAll}>
            <LogOut className="w-4 h-4" />
            Выйти на всех устройствах
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Завершит все активные сеансы, включая этот. После этого потребуется войти заново и подтвердить вход кодом 2FA,
          если она включена.
        </p>
      </Card>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
