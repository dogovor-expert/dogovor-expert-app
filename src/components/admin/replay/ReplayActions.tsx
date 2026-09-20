"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

async function remove(body: Record<string, unknown>): Promise<number> {
  const res = await fetch("/api/admin/replays", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("delete failed");
  const data = (await res.json().catch(() => null)) as { deleted?: number } | null;
  return data?.deleted ?? 1;
}

/** Кнопка удаления одной записи визита с inline-подтверждением. */
export function ReplayDeleteButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "confirm" | "busy">("idle");

  const doDelete = async () => {
    setState("busy");
    try {
      await remove({ sessionId });
      router.refresh();
    } catch {
      setState("idle");
    }
  };

  if (state === "confirm") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => { void doDelete(); }}
          className="text-xs font-semibold text-red-600 hover:underline"
        >
          Удалить
        </button>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Отмена
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setState("confirm")}
      disabled={state === "busy"}
      title="Удалить запись"
      aria-label="Удалить запись"
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {state === "busy" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}

/** Массовое удаление записей старше N дней. */
export function ReplayBulkDelete({ defaultDays = 30 }: { defaultDays?: number }) {
  const router = useRouter();
  const [days, setDays] = useState(String(defaultDays));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const run = async () => {
    const n = Number(days);
    if (!Number.isFinite(n) || n < 1) { setMsg("Укажите число дней ≥ 1"); return; }
    setBusy(true);
    setMsg("");
    try {
      const deleted = await remove({ olderThanDays: Math.round(n) });
      setMsg(`Удалено записей: ${deleted}`);
      router.refresh();
    } catch {
      setMsg("Не удалось удалить");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-gray-600">Удалить записи старше</span>
      <input
        type="number"
        min={1}
        value={days}
        onChange={(e) => setDays(e.target.value)}
        className="w-20 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
        aria-label="Дней"
      />
      <span className="text-gray-600">дней</span>
      <button
        type="button"
        onClick={() => { void run(); }}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        Удалить старые
      </button>
      {msg && <span className="text-gray-500">{msg}</span>}
    </div>
  );
}
