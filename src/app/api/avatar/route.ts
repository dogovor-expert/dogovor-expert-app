import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withCsrf } from "@/lib/csrf";
import { checkRateLimit, limiters } from "@/lib/ratelimit";
import { ALLOWED_AVATAR_MIME, MAX_AVATAR_BYTES, detectImageKind } from "@/lib/upload/imageValidate";

// 5.6 (аудит 2026-09): загрузка аватара с OWASP-валидацией (4 gate):
//  1. декларированный MIME — белый список (jpeg/png/webp/avif);
//  2. размер ≤ 5 МБ;
//  3. магические байты (detectImageKind) — не верим MIME/расширению;
//  4. ре-энкод sharp → WEBP 512×512 cover: убивает полиглоты, EXIF (GPS!)
//     и любые скрипты внутри контейнера; MIME ответа задаём сами.
// Файл в бакет «avatars» кладёт сервер от имени пользователя (RLS по папке
// user.id сохраняется), старое фото вычищается best-effort.
export const runtime = "nodejs";

const MAX_DIM = 512;

export const POST = withCsrf(async (req: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(limiters.avatarUpload, user.id);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "too_many_requests", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "multipart form expected" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  // Gate 1+2: декларированный MIME и размер.
  if (!ALLOWED_AVATAR_MIME.includes(file.type as (typeof ALLOWED_AVATAR_MIME)[number])) {
    return NextResponse.json({ error: "type_not_allowed" }, { status: 415 });
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  // Gate 3: сигнатура по фактическим байтам.
  const raw = new Uint8Array(await file.arrayBuffer());
  const kind = detectImageKind(raw);
  if (!kind) {
    return NextResponse.json({ error: "signature_mismatch" }, { status: 415 });
  }

  // Gate 4: ре-энкод (источник истины по содержимому — polyglot здесь отваливается).
  let webp: Uint8Array;
  try {
    const sharp = (await import("sharp")).default;
    const out = await sharp(raw, { failOn: "error" })
      .rotate() // учитываем EXIF-ориентацию ДО удаления метаданных
      .resize(MAX_DIM, MAX_DIM, { fit: "cover", position: "attention" })
      .webp({ quality: 85 })
      .toBuffer();
    webp = new Uint8Array(out);
  } catch {
    return NextResponse.json({ error: "not_a_valid_image" }, { status: 415 });
  }

  const path = `${user.id}/avatar-${Date.now()}.webp`;
  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, webp, { contentType: "image/webp", upsert: false });
  if (upErr) {
    return NextResponse.json({ error: "storage_upload_failed" }, { status: 500 });
  }

  // Старые аватары пользователя — best-effort чистка (не блокируем успех).
  void (async () => {
    try {
      const { data: objects } = await supabase.storage.from("avatars").list(user.id, { limit: 100 });
      const stale = (objects ?? [])
        .map((o) => `${user.id}/${o.name}`)
        .filter((p) => p !== path);
      if (stale.length) await supabase.storage.from("avatars").remove(stale);
    } catch {
      /* ignore */
    }
  })();

  const url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
  if (dbErr) {
    return NextResponse.json({ error: "profile_update_failed" }, { status: 500 });
  }

  return NextResponse.json({ url });
});
