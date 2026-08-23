"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export default function ExportButton({ type, label = "Экспорт CSV" }: { type: string; label?: string }) {
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/export?type=${type}`);
      if (!res.ok) {
        alert("Не удалось выгрузить: " + res.status);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
    >
      <Download className="w-4 h-4" />
      {busy ? "…" : label}
    </button>
  );
}
