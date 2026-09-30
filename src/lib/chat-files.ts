import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Вложения чата: файлы живут в приватном бакете Supabase Storage, наружу
 * отдаются подписанной ссылкой с тем же сроком, что и переписка (30 дней).
 * Бакет создаётся лениво — при первом обращении.
 */
const BUCKET = "chat-files";
export const CHAT_FILE_MAX = 10 * 1024 * 1024; // 10 МБ
export const CHAT_FILE_TTL = 60 * 60 * 24 * 30; // 30 дней

/** Разрешённые типы: изображения (скриншоты/фото) и типовые документы. */
const ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export function isAllowedMime(mime: string): boolean {
  return ALLOWED_MIME.includes(mime);
}

export function fileKind(mime: string): "image" | "file" {
  return mime.startsWith("image/") ? "image" : "file";
}

let bucketReady = false;
async function ensureBucket(): Promise<void> {
  if (bucketReady) return;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.storage.getBucket(BUCKET);
    if (!data) {
      await supabase.storage.createBucket(BUCKET, { public: false, fileSizeLimit: CHAT_FILE_MAX });
    }
  } catch {
    /* бакет уже есть или нет прав — попробуем загрузить как есть */
  }
  bucketReady = true;
}

/** Загрузить вложение и вернуть подписанную ссылку. */
export async function uploadChatFile(
  path: string,
  bytes: ArrayBuffer | Uint8Array,
  contentType: string
): Promise<{ url: string; path: string } | null> {
  await ensureBucket();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType, upsert: false });
    if (error) {
      console.error("[chat-files] upload failed:", error.message);
      return null;
    }
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, CHAT_FILE_TTL);
    if (!data?.signedUrl) return null;
    return { url: data.signedUrl, path };
  } catch (e) {
    console.error("[chat-files] upload exception:", String(e));
    return null;
  }
}

/**
 * 152-ФЗ: удалить вложения чата старше CHAT_FILE_TTL.
 *
 * ⚠️ До 30.09.2026 объявленный TTL ничем не поддерживался: файлы попадали в
 * бакет `chat-files` и оставались там навсегда, потому что удаляющая функция
 * просто не существовала. Из-за этого в политике нельзя было честно написать
 * срок хранения (Рособрнадзор требует указывать сроки хранения ПДн).
 *
 * Функция вызывается из /api/cron/daily-maintenance.
 */
export async function deleteExpiredChatFiles(
  now = Date.now()
): Promise<{ deleted: number; error?: string }> {
  try {
    await ensureBucket();
    const supabase = createAdminClient();
    const cutoff = new Date(now - CHAT_FILE_TTL).toISOString();
    const expired: string[] = [];

    // Supabase Storage не умеет фильтровать по дате, поэтому обходим
    // папки посетителей и отбираем объекты старше отсечки.
    let queue: string[] = [""];
    // Ограничение глубины: защита от бесконечного обхода при «плохом» бакете.
    for (let depth = 0; depth < 3 && queue.length > 0; depth++) {
      const next: string[] = [];
      for (const prefix of queue) {
        const { data, error } = await supabase.storage
          .from(BUCKET)
          .list(prefix, { limit: 1000 });
        if (error) return { deleted: 0, error: error.message };
        for (const obj of data ?? []) {
          if (obj.id && obj.updated_at && new Date(obj.updated_at).getTime() < new Date(cutoff).getTime()) {
            expired.push(obj.name ? (prefix ? `${prefix}/${obj.name}` : obj.name) : obj.name);
          } else if (!obj.id) {
            // Папка (visitorId) — спускаемся глубже.
            next.push(obj.name);
          }
        }
      }
      queue = next;
    }

    if (expired.length === 0) return { deleted: 0 };
    // Удаляем пачками: у Storage есть лимит на размер одного запроса.
    let deleted = 0;
    for (let i = 0; i < expired.length; i += 50) {
      const chunk = expired.slice(i, i + 50);
      const { error } = await supabase.storage.from(BUCKET).remove(chunk);
      if (error) return { deleted, error: error.message };
      deleted += chunk.length;
    }
    return { deleted };
  } catch (e) {
    return { deleted: 0, error: String(e) };
  }
}