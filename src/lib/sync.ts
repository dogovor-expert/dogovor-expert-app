import type { DraftData, DraftVersion } from "@/lib/autosave";

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  queue = next.catch(() => {});
  return next;
}

export function canSync(): boolean {
  return typeof window !== "undefined" && Boolean(
    (window as any).__DOGOVOR_USER__
  );
}

function getDraftRecord(d: DraftData) {
  return {
    template_id: d.templateId,
    title: d.values?.document_title || d.templateId,
    fields: d.values,
    checklist: d.checklist,
    versions: [] as DraftVersion[],
  };
}

/** Merge: предпочитаем значения из локального draft для непустых полей;
 *  отсутствующие в local берём из server. Не трогаем checklist — там
 *  предпочтительнее серверное состояние, чтобы не сбрасывать пройденные
 *  пользователем галочки из другой вкладки. */
function mergeFields(local: Record<string, string>, server: Record<string, string>) {
  const out: Record<string, string> = { ...server };
  for (const [k, v] of Object.entries(local || {})) {
    if (v !== "" && v !== null && v !== undefined) out[k] = v;
  }
  return out;
}

export async function syncDraft(d: DraftData): Promise<boolean> {
  if (!canSync()) return false;
  return enqueue(async () => {
    try {
      const res = await fetch("/api/documents", {
        method: "GET",
      });
      if (!res.ok) return false;
      const { data } = await res.json();
      // Берём самый свежий draft по этому шаблону (sort by updated_at DESC уже на сервере)
      const existing = (data as any[]).find(
        (r) => r.template_id === d.templateId
      );
      if (existing) {
        const upd = await fetch(`/api/documents/${existing.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            // Оптимистичная блокировка: сервер вернёт 409, если документ
            // изменился с момента нашего GET (другая вкладка).
            "If-Match": existing.updated_at || "",
          },
          body: JSON.stringify({
            fields: d.values,
            checklist: d.checklist,
          }),
        });
        if (upd.status === 409) {
          // Конфликт версий: мержим локальные данные поверх сервера и пробуем ещё раз
          const body = await upd.json().catch(() => null);
          const serverFields = body?.current?.fields || {};
          const merged = mergeFields(d.values, serverFields);
          const retry = await fetch(`/api/documents/${existing.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "If-Match": body?.current?.updated_at || "",
            },
            body: JSON.stringify({
              fields: merged,
              checklist: d.checklist,
            }),
          });
          return retry.ok;
        }
        return upd.ok;
      }
      const created = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getDraftRecord(d)),
      });
      return created.ok;
    } catch {
      return false;
    }
  });
}

export async function syncDelete(templateId: string): Promise<boolean> {
  if (!canSync()) return false;
  return enqueue(async () => {
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) return false;
      const { data } = await res.json();
      const existing = (data as any[]).find(
        (r) => r.template_id === templateId
      );
      if (!existing) return false;
      const del = await fetch(`/api/documents/${existing.id}`, {
        method: "DELETE",
      });
      return del.ok;
    } catch {
      return false;
    }
  });
}

export function setUserFlag(userSet: boolean) {
  (window as any).__DOGOVOR_USER__ = userSet;
}