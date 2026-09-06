import ChatInbox from "@/components/admin/ChatInbox";

export const dynamic = "force-dynamic";

export default function AdminChatPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Чат поддержки</h1>
      <p className="text-sm text-gray-600 mb-6">
        Все диалоги посетителей (read-only). Отвечать удобнее в Telegram — темы
        синхронизированы, push-уведомления работают.
      </p>
      <ChatInbox />
    </div>
  );
}
