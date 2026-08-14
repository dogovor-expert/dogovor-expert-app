"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { getAllDrafts } from "@/lib/autosave";
import LeadsPanel from "@/components/dashboard/LeadsPanel";
import { FileText, FolderOpen, Plus, ArrowRight, Sparkles, ShieldCheck, Files, CreditCard } from "lucide-react";

interface ProfileData {
  full_name: string | null;
  inn: string | null;
  is_admin: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [email, setEmail] = useState("");
  const [serverDocs, setServerDocs] = useState<{ template_id: string; updated_at: string }[]>([]);
  const [localCount, setLocalCount] = useState(0);
  const [sub, setSub] = useState<{ subscription_active: boolean; plan: string }>({ subscription_active: false, plan: "free" });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.replace("/login");
      return;
    }
    setEmail(data.user.email ?? "");
    const pRes = await fetch("/api/profile").catch(() => null);
    if (pRes?.ok) {
      const { data: p } = await pRes.json();
      setProfile(p);
    }
    const dRes = await fetch("/api/documents").catch(() => null);
    if (dRes?.ok) {
      const { data } = await dRes.json();
      setServerDocs(Array.isArray(data) ? data : []);
    }
    setLocalCount(getAllDrafts().length);
    const sRes = await fetch("/api/subscription-status").catch(() => null);
    if (sRes?.ok) {
      const s = await sRes.json();
      setSub({ subscription_active: !!s.subscription_active, plan: s.plan ?? "free" });
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400 text-sm">
        Загрузка кабинета…
      </div>
    );
  }

  const totalDocs = Math.max(serverDocs.length, localCount);
  const firstName = (profile?.full_name || email || "Пользователь").split(" ")[0];
  const generatedCount = serverDocs.length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile?.full_name ? `Здравствуйте, ${firstName}!` : "Личный кабинет"}
          </h1>
          <p className="text-gray-500 mt-1">
            {generatedCount > 0
              ? `У вас ${generatedCount} ${generatedCount === 1 ? "документ" : generatedCount < 5 ? "документа" : "документов"}`
              : "Создайте первый документ за пару минут"}
          </p>
        </div>
        <Link href="/builder">
          <Button variant="primary" size="lg">
            <Plus className="w-4 h-4" />
            Создать договор
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-brand-500" />
            </div>
            <p className="text-sm text-gray-500">Всего документов</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalDocs}</p>
          <p className="text-xs text-gray-400 mt-1">включая черновики</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            <p className="text-sm text-gray-500">Тариф</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 capitalize">
            {sub.subscription_active && sub.plan !== "free" ? sub.plan : "Бесплатный"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {sub.subscription_active && sub.plan !== "free" ? "оплачен до конца периода" : "990 ₽/мес — без ограничений"}
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-purple-500" />
            </div>
            <p className="text-sm text-gray-500">Автозаполнение</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{profile?.inn ? "Есть" : "Нет"}</p>
          <Link href="/settings/profile" className="text-xs text-brand-600 hover:underline mt-1 inline-block">
            {profile?.inn ? "Настроить реквизиты →" : "Добавить ИНН →"}
          </Link>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Последние документы</h2>
          <Link href="/documents" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
            Все документы <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {serverDocs.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <FolderOpen className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-800 mb-1">Здесь будут ваши договоры</p>
            <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
              Создайте договор в конструкторе — он сразу появится в списке и будет сохранён в аккаунте
            </p>
            <Link href="/builder">
              <Button variant="outline" size="sm">
                <Plus className="w-3.5 h-3.5" />
                Создать первый документ
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {serverDocs.slice(0, 5).map((d) => (
              <Link
                key={d.template_id}
                href={`/preview?template=${d.template_id}`}
                className="flex items-center gap-3 py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Files className="w-4 h-4 text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {d.template_id.replace(/-/g, " ")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(d.updated_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <Badge variant="blue" size="sm">Черновик</Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {profile?.is_admin && <LeadsPanel />}

      <Card className="p-6 bg-gradient-to-br from-brand-50 to-purple-50 border-brand-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Тариф Pro за 990 ₽/мес</h3>
            <p className="text-sm text-gray-600 mt-1">
              Неограниченные расчёты, экспорт в PDF, история, все калькуляторы без рекламы.
            </p>
          </div>
          {profile?.is_admin && (
            <Link href="/admin">
              <Button variant="secondary" size="md">
                Админ-панель
              </Button>
            </Link>
          )}
          <Link href="/billing">
            <Button variant="primary" size="md">
              <CreditCard className="w-4 h-4" />
              {sub.subscription_active && sub.plan !== "free" ? "Управление" : "Оформить"}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}