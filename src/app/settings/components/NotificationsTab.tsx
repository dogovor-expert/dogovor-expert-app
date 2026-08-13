"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Loader2, Bell, Mail, MessageSquare, Send } from "lucide-react";

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 ${
        checked ? "bg-brand-500" : "bg-gray-200"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

export default function NotificationsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then(({ data }) => {
        if (data) setNotifyEmail(data.notify_email);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (value: boolean) => {
    setNotifyEmail(value);
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notify_email: value }),
      });
      if (!res.ok) setNotifyEmail(!value);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card variant="elevated" padding="lg">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
            Загрузка…
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4.5 h-4.5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Уведомления на email</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    О новых функциях и важных событиях аккаунта
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {saving && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                <Toggle checked={notifyEmail} onChange={handleToggle} />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-5">
              {[
                {
                  icon: Send,
                  color: "bg-gray-50 text-gray-400",
                  title: "Telegram",
                  desc: "Уведомления в Telegram-боте",
                },
                {
                  icon: MessageSquare,
                  color: "bg-gray-50 text-gray-400",
                  title: "SMS-сообщения",
                  desc: "Важные события по SMS",
                },
                {
                  icon: Bell,
                  color: "bg-gray-50 text-gray-400",
                  title: "Напоминания о договорах",
                  desc: "Об окончании срока действия",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">{item.title}</h4>
                        <p className="text-sm text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-300 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 mt-1 flex-shrink-0">
                      Скоро
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}