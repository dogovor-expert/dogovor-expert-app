import { requireAdminPage } from "@/lib/admin-auth";
import FeedbackAdminTable from "@/components/admin/FeedbackAdminTable";
import ExportButton from "@/components/admin/ExportButton";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  await requireAdminPage();
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Обратная связь</h1>
        <p className="text-gray-600 text-sm">
          Заявки с сайта и виджета. Клик по строке — детали, скриншоты и техданные. Смена статуса — прямо в таблице.
        </p>
      </div>
      <ExportButton type="feedback" />
      <FeedbackAdminTable />
    </div>
  );
}
