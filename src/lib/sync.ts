import type { DraftData, DraftVersion } from "@/lib/autosave";

type DogovorWindow = Window & { __DOGOVOR_USER__?: boolean };

/**
 * ⛔ АВТОСИНХРОНИЗАЦИЯ НА СЕРВЕР ОТКЛЮЧЕНА (30.09.2026).
 *
 * Здесь был путь, который каждые ~30 секунд отправлял содержимое черновика
 * на `/api/documents` методом POST/PATCH — автоматически, без кнопки и без
 * согласия пользователя. В `fields` уезжали ФИО, ИНН, паспорт и адреса
 * третьих лиц по договору, открытым текстом, в таблицу `documents`.
 *
 * Ручной импорт (`POST /api/import`) закрыли раньше, но эта автоматическая
 * синхронизация осталась живой: закрытие одного эндпоинта не давало эффекта,
 * потому что данные уходили другим путём. Ничто в сайте не требует её работы —
 * заполнение, сохранение в локальный vault, экспорт в PDF и «Облачные диски»
 * от неё не зависят, поэтому отключение ничего не ломает.
 *
 * Что осталось намеренно:
 *   • `/api/documents` на ЧТЕНИЕ и УДАЛЕНИЕ — чтобы показать пользователю
 *     баннер «N документов на сервере» и дать перенести их в зашифрованный
 *     локальный vault, а затем удалить серверную копию. Это миграция
 *     наследия, а не синхронизация.
 *   • `setUserFlag`/`canSync` — чтобы UI корректно знал, что синхронизации нет.
 *
 * Синхронизация между устройствами теперь возможна только двумя способами,
 * оба не оставляют содержимое у нас: локальный vault с переносом ключа
 * (QR/файл) либо «Облачные диски», где файл уходит провайдеру
 * (Яндекс.Диск / Google Drive / Dropbox) напрямую с устройства.
 */

interface ServerDocLite {
  id: string;
  template_id: string;
  updated_at?: string;
}

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  queue = next.catch(() => {});
  return next;
}

/**
 * Всегда false: отправка содержимого на сервер отключена.
 * Сигнатура сохранена, чтобы UI мог опрашивать состояние синхронизации.
 */
export function canSync(): boolean {
  return false;
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

/**
 * Заглушка: раньше отправляла содержимое на сервер, теперь ничего не делает.
 * Вызовы в builder/page.tsx оставлены как есть, чтобы не трогать горячий
 * путь автосохранения; фактической отправки больше нет.
 */
export async function syncDraft(_d: DraftData): Promise<boolean> {
  return false;
}

/**
 * Удаление серверной копии документа.
 *
 * Это НЕ синхронизация: ничего не отправляет, только стирает наследие.
 * Поэтому здесь намеренно нет гейта `canSync()` — иначе, после его
 * отключения, пользователь не смог бы удалить старый документ с сервера,
 * а баннер миграции так и остался бы вечно висимым.
 */
export async function syncDelete(templateId: string): Promise<boolean> {
  return enqueue(async () => {
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) return false;
      const { data } = (await res.json()) as { data?: ServerDocLite[] };
      const existing = (data ?? []).find(
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
  (window as DogovorWindow).__DOGOVOR_USER__ = userSet;
}