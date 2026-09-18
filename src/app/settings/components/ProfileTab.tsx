"use client";
import { type FormEvent, useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { isValidInn, formatInn } from "@/lib/inn";
import { formatPhoneRu } from "@/lib/format";
import { Camera, Loader2, CheckCircle, Save, Mail } from "lucide-react";

interface ProfileData {
  full_name: string | null;
  phone: string | null;
  company: string | null;
  inn: string | null;
  avatar_url: string | null;
  signature: string | null;
  notify_email: boolean;
  is_admin: boolean;
  created_at: string;
  email: string | null;
}

export default function ProfileTab() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    company: "",
    inn: "",
    signature: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const { data } = (await res.json()) as { data: ProfileData };
        setProfile(data);
        setForm({
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          company: data.company ?? "",
          inn: data.inn ?? "",
          signature: data.signature ?? "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    // Клиентские подсказки (быстрые фидбеки). Сервер всё равно проверяет
    // magic-bytes и ре-энкодит через sharp (5.6 / OWASP) — не доверяем этим.
    if (!file.type.startsWith("image/")) {
      showToast("Нужен файл изображения");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Файл больше 5 МБ");
      return;
    }
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/avatar", { method: "POST", body: fd });
      if (!res.ok) {
        const msg: Record<string, string> = {
          type_not_allowed: "Разрешены только JPEG, PNG, WEBP или AVIF",
          too_large: "Файл больше 5 МБ",
          signature_mismatch: "Файл не является изображением (проверка по содержимому)",
          not_a_valid_image: "Изображение повреждено и не может быть обработано",
          storage_upload_failed: "Не удалось сохранить файл",
          profile_update_failed: "Не удалось обновить профиль",
          too_many_requests: "Слишком много попыток, подождите минуту",
        };
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        showToast((body?.error ? msg[body.error] : undefined) ?? "Не удалось загрузить аватар");
        return;
      }
      const json = (await res.json()) as { url?: string };
      const url = json.url ?? "";
      setProfile((p) => (p ? { ...p, avatar_url: url } : p));
      window.dispatchEvent(new Event("dogovor:profile"));
      showToast("Аватар обновлён");
    } catch {
      showToast("Не удалось загрузить аватар");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (form.inn && !isValidInn(form.inn)) {
      nextErrors.inn = "Укажите корректный ИНН (10 или 12 цифр)";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const { data } = (await res.json()) as { data: Partial<ProfileData> };
        setProfile((p) => (p ? { ...p, ...data } : p));
        setSaved(true);
        showToast("Профиль сохранён");
        setTimeout(() => setSaved(false), 2000);
        window.dispatchEvent(new Event("dogovor:profile"));
      } else {
        const { error } = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(error || "Не удалось сохранить");
      }
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.full_name || "П").trim().charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url;

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }}>
      <Card variant="elevated" padding="lg">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-600 text-sm">
            Загрузка профиля…
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-white text-2xl font-bold ${
                    avatarUrl ? "" : "bg-gradient-to-br from-brand-400 to-brand-600"
                  }`}
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- URL аватара приходит из Supabase Storage и может быть внешним; размеры фиксированы контейнером
                    <img src={avatarUrl} alt="Аватар" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-brand-600 hover:border-brand-300 transition-colors"
                  title="Загрузить аватар"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { void handleAvatarUpload(e); }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {form.full_name || "Пользователь"}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  {profile?.email}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {profile?.created_at
                    ? `С нами с ${new Date(profile.created_at).toLocaleDateString("ru-RU")}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Полное имя"
                id="fullname"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Иван Иванов"
              />
              <Input
                label="Телефон"
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value ? formatPhoneRu(e.target.value) : "" })}
                placeholder="+7 (900) 000-00-00"
              />
              <Input
                label="Компания"
                id="company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="ООО «Ромашка»"
              />
              <Input
                label="ИНН"
                id="inn"
                value={form.inn}
                error={errors.inn}
                onChange={(e) => setForm({ ...form, inn: formatInn(e.target.value) })}
                placeholder="0000000000"
                inputMode="numeric"
              />
            </div>

            <div>
              <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-1.5">
                Подпись
              </label>
              <textarea
                id="signature"
                value={form.signature}
                onChange={(e) => setForm({ ...form, signature: e.target.value.slice(0, 500) })}
                rows={3}
                placeholder="Должность, ФИО — используется в конце документов"
                className="block w-full px-4 py-2.5 text-sm transition-all duration-200 border rounded-xl border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-500/20"
              />
              <p className="text-xs text-gray-600 mt-1.5">{form.signature.length}/500</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600 max-w-xs hidden sm:block">
                Реквизиты используются при автозаполнении договоров и актов
              </p>
              <Button type="submit" disabled={saving || loading} className="ml-auto">
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Сохранение…" : saved ? "Сохранено" : "Сохранить изменения"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </form>
  );
}