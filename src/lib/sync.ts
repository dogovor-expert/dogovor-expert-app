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
    title: d.templateId,
    fields: d.values,
    checklist: d.checklist,
    versions: [] as DraftVersion[],
  };
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
      const existing = (data as any[]).find(
        (r) => r.template_id === d.templateId
      );
      if (existing) {
        const upd = await fetch(`/api/documents/${existing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: d.values,
            checklist: d.checklist,
          }),
        });
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