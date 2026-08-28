// Низкоуровневые вызовы Telegram Bot API для чата-моста.
// Без сторонних SDK — только fetch к api.telegram.org (уже используется в @/lib/mail).

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPPORT_GROUP_ID = process.env.TELEGRAM_SUPPORT_GROUP_ID;

export const TELEGRAM_CONFIGURED = Boolean(TOKEN && SUPPORT_GROUP_ID);

async function call(method: string, body: Record<string, unknown>): Promise<{
  ok: boolean;
  result?: unknown;
  description?: string;
}> {
  if (!TOKEN) return { ok: false, description: "no token" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await res.json()) as { ok: boolean; result?: unknown; description?: string };
  } catch (e) {
    return { ok: false, description: String(e) };
  }
}

/** Экранирование для parse_mode=HTML (в TEXT-сообщениях). */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Создать тему (forum topic) в супергруппе. Возвращает message_thread_id. */
export async function createForumTopic(name: string): Promise<number | null> {
  if (!SUPPORT_GROUP_ID) return null;
  const r = await call("createForumTopic", {
    chat_id: SUPPORT_GROUP_ID,
    name: name.slice(0, 128),
  });
  if (!r.ok) {
    console.error("[telegram] createForumTopic failed:", r.description);
    return null;
  }
  const result = r.result as { message_thread_id?: number } | undefined;
  return result?.message_thread_id ?? null;
}

/** Отправить сообщение в конкретную тему супергруппы. Делит длинные тексты (>4000). */
export async function sendToTopic(threadId: number, text: string): Promise<boolean> {
  if (!SUPPORT_GROUP_ID) return false;
  const chunks = splitMessage(text);
  let okAll = true;
  for (const chunk of chunks) {
    const r = await call("sendMessage", {
      chat_id: SUPPORT_GROUP_ID,
      message_thread_id: threadId,
      text: chunk,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    if (!r.ok) {
      console.error("[telegram] sendMessage failed:", r.description);
      okAll = false;
    }
  }
  return okAll;
}

/** Установить webhook с секретом (для валидации входящих). */
export async function setWebhook(url: string, secret: string): Promise<boolean> {
  const r = await call("setWebhook", {
    url,
    secret_token: secret,
    allowed_updates: ["message"],
    drop_pending_updates: true,
  });
  return r.ok;
}

export async function deleteWebhook(): Promise<boolean> {
  const r = await call("deleteWebhook", { drop_pending_updates: true });
  return r.ok;
}

function splitMessage(text: string, max = 4000): string[] {
  if (text.length <= max) return [text];
  const out: string[] = [];
  let rest = text;
  while (rest.length > max) {
    let cut = rest.lastIndexOf("\n", max);
    if (cut <= 0) cut = rest.lastIndexOf(" ", max);
    if (cut <= 0) cut = max;
    out.push(rest.slice(0, cut));
    rest = rest.slice(cut).replace(/^\s+/, "");
  }
  if (rest) out.push(rest);
  return out;
}
