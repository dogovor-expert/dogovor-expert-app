"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { Download, Trash2, Database, FileJson, Loader2 } from "lucide-react";

export default function DataTab() {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    if (confirmEmail.trim().toLowerCase() !== (user.email ?? "").toLowerCase()) {
      setError("Введённый email не совпадает с адресом аккаунта");
      return;
    }
    if (!agree) {
      setError("Подтвердите, что понимаете последствия");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (res.ok) {
        await supabase.auth.signOut();
        window.location.href = "/";
      } else {
        const { error: msg } = await res.json().catch(() => ({}));
        setError(msg || "Не удалось удалить аккаунт");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
            <FileJson className="w-4.5 h-4.5 text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Экспорт данных</h3>
            <p className="text-sm text-gray-500">
              Все данные аккаунта: профиль, документы, подписки, платежи
            </p>
          </div>
        </div>
        <a
          href="/api/profile/export"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all focus:ring-2 focus:ring-gray-400 focus:outline-none"
        >
          <Download className="w-4 h-4" />
          Скачать JSON
        </a>
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" />
          Статья 152-ФЗ «О персональных данных»: вы вправе получить свои данные в любой момент
        </p>
      </Card>

      <Card variant="elevated" padding="lg" className="border-red-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <Trash2 className="w-4.5 h-4.5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Удаление аккаунта</h3>
            <p className="text-sm text-gray-500">
              Профиль, документы и файлы будут удалены безвозвратно
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Введите email аккаунта для подтверждения"
            id="delete-confirm"
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <label className="flex items-start gap-2.5 cursor-pointer text-sm text-gray-600">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-400"
            />
            <span>
              Я понимаю, что данные будут удалены окончательно, а возврат к аккаунту станет
              невозможен
            </span>
          </label>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="button" variant="danger" onClick={handleDelete} disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {busy ? "Удаление…" : "Удалить аккаунт навсегда"}
          </Button>
        </div>
      </Card>
    </div>
  );
}