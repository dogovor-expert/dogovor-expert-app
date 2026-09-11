import { requireAdminPage } from "@/lib/admin-auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Вторая линия защиты: даже если middleware пропустит, страница сама проверит права.
  const admin = await requireAdminPage();
  return (
    <AdminShell userEmail={admin.email ?? ""} role={admin.role}>
      {children}
    </AdminShell>
  );
}
