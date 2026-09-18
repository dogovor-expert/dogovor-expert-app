"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";

interface VaultUnlockDialogProps {
  open: boolean;
  /** true — на этом устройстве нет ключа, пароль обязателен */
  mandatory: boolean;
  onUnlocked: () => void;
  onCancel?: () => void;
}

export default function VaultUnlockDialog({
  open,
  mandatory,
  onUnlocked,
  onCancel,
}: VaultUnlockDialogProps) {
  const [passphrase, setPassphrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = async () => {
    setError(null);
    if (!passphrase) {
      setError("Введите пароль");
      return;
    }
    setBusy(true);
    try {
      const { unlockWithPassphrase } = await import("@/lib/vault/keyManager");
      await unlockWithPassphrase(passphrase);
      setPassphrase("");
      onUnlocked();
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes("Пароль не задан")) {
        setError("Пароль ещё не был установлен. Настройте его в «Настройки → Защищённое хранилище».");
      } else {
        setError("Неверный пароль. Попробуйте ещё раз.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">
              Хранилище заблокировано
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {mandatory
                ? "Это устройство новое — нужен ваш пароль"
                : "Для продолжения введите пароль хранилища"}
            </p>
          </div>
        </div>

        <Input
          type="password"
          label="Пароль хранилища"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          placeholder="••••••••"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
          }}
        />

        {error && (
          <p className="text-xs text-red-600 mt-2 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            {error}
          </p>
        )}

        <Button onClick={() => { void submit(); }} disabled={busy || !passphrase} className="w-full mt-4">
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              Разблокировать
            </>
          )}
        </Button>

        {!mandatory && onCancel && (
          <button
            onClick={onCancel}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-700 transition-colors mt-3"
          >
            Отмена
          </button>
        )}
      </div>
    </div>
  );
}