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