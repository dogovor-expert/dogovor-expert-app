import { requireAdminPage } from "@/lib/admin-auth";
import LeadsPanel from "@/components/dashboard/LeadsPanel";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  await requireAdminPage();
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Лиды (растаможка)</h1>
        <p className="text-gray-600 text-sm">Заявки из калькулятора «Растаможка». Меняйте статус прямо в карточке.</p>
      </div>
      <LeadsPanel />
    </div>
  );
}
