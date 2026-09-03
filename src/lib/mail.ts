import { SUPPORT_EMAIL } from "@/lib/site";
import tls from "node:tls";

export interface EmailAttachment {
  /** Имя файла, видимое получателю. */
  filename: string;
  /** MIME-тип (например, "application/pdf"). */
  mimeType?: string;
  /** Base64-кодированное содержимое файла. */
  contentBase64: string;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  /**
   * Опциональные вложения. Поддерживаются всеми провайдерами
   * (ZeptoMail, Resend, Zoho SMTP). Для Zoho SMTP вложение кодируется
   * как MIME-part внутри `multipart/mixed` сообщения.
   */
  attachments?: EmailAttachment[];
}

/**
 * Возвращает true, если настроен хотя бы один провайдер отправки почты.
 * Используется API-роутами, чтобы не отвечать 501 "email_not_configured",
 * когда технически отправка возможна (например, настроен только Zoho SMTP).
 */
export function isMailConfigured(): boolean {
  return Boolean(
    process.env.ZEPTOMAIL_TOKEN ||
      process.env.RESEND_API_KEY ||
      (process.env.ZOHO_SMTP_USER && process.env.ZOHO_SMTP_PASS)
  );
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const { to, subject, html, attachments = [] } = input;
  const zeptoToken = process.env.ZEPTOMAIL_TOKEN;
  const resendKey = process.env.RESEND_API_KEY;
  const zohoUser = process.env.ZOHO_SMTP_USER;
  const zohoPass = process.env.ZOHO_SMTP_PASS;

  const fromRaw = process.env.EMAIL_FROM || zohoUser || "no-reply@dogovor.expert";
  const fromName = process.env.EMAIL_FROM_NAME || "Dogovor.expert";

  // 1) Zeptomail (приоритет, если задан)
  if (zeptoToken) {
    try {
      const res = await fetch("https://api.zeptomail.com/v1.1/email/single", {
        method: "POST",
        headers: { Authorization: `Zoho-enczapikey ${zeptoToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: { address: fromRaw, name: fromName },
          to: [{ email_address: { address: to } }],
          subject,
          htmlbody: html,
          attachments: attachments.map((a) => ({
            base64: a.contentBase64,
            filename: a.filename,
            mime_type: a.mimeType,
          })),
        }),
      });
      if (res.ok) return true;
      console.error("[mail] zeptomail error", res.status);
    } catch (e) {
      console.error("[mail] zeptomail throw", (e as Error)?.message);
    }
  }

  // 2) Resend (fallback)
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `${fromName} <${fromRaw}>`,
          to: [to],
          subject,
          html,
          attachments: attachments.map((a) => ({
            filename: a.filename,
            content: a.contentBase64,
            ...(a.mimeType ? { contentType: a.mimeType } : {}),
          })),
        }),
      });
      if (res.ok) return true;
      console.error("[mail] resend error", res.status);
    } catch (e) {
      console.error("[mail] resend throw", (e as Error)?.message);
    }
  }

  // 3) Zoho Mail SMTP (Путь Б — использует существующий ящик Zoho Mail, без внешних зависимостей)
  if (zohoUser && zohoPass) {
    const ok = await sendViaZohoSmtp({
      host: process.env.ZOHO_SMTP_HOST || "smtp.zoho.com",
      port: Number(process.env.ZOHO_SMTP_PORT || 465),
      user: zohoUser,
      pass: zohoPass,
      from: fromRaw,
      fromName,
      to,
      subject,
      html,
      attachments,
    });
    if (ok) return true;
    console.error("[mail] zoho smtp failed");
  }

  return false;
}

interface SmtpOpts {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  html: string;
  attachments: EmailAttachment[];
}

// Минимальный SMTP-клиент поверх node:tls (implicit TLS, порт 465).
// Без зависимостей, чтобы не ломать package-lock на деплое.
async function sendViaZohoSmtp(o: SmtpOpts): Promise<boolean> {
  return new Promise((resolve) => {
    const sock = tls.connect(o.port, o.host, { timeout: 20000, servername: o.host });
    let buf = "";
    const responses: { code: number; text: string }[] = [];
    let pending: ((r: { code: number; text: string }) => void) | null = null;
    const helo = (process.env.SITE_URL || "dogovor.expert").replace(/^https?:\/\//, "");

    const pushLine = (line: string) => {
      const m = /^(\d{3})([ -])(.*)$/.exec(line);
      if (m && m[2] === " ") responses.push({ code: parseInt(m[1], 10), text: m[3] });
    };
    const onData = (d: string) => {
      buf += d;
      let idx: number;
      while ((idx = buf.indexOf("\r\n")) >= 0) {
        const line = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        pushLine(line);
      }
      if (pending && responses.length) {
        const p = pending;
        pending = null;
        const next = responses.shift();
        if (next) p(next);
      }
    };
    const wait = () =>
      new Promise<{ code: number; text: string }>((res) => {
        const next = responses.shift();
        if (next) res(next);
        else pending = res;
      });
    const cmd = (c: string) =>
      new Promise<{ code: number; text: string }>((res) => {
        pending = res;
        sock.write(c);
      });

    sock.setEncoding("utf8");
    sock.on("data", (d) => onData(d as string));
    sock.on("error", () => resolve(false));
    sock.on("timeout", () => {
      sock.destroy();
      resolve(false);
    });
    sock.on("close", () => resolve(false));

    void (async () => {
      const g = await wait(); // 220 greeting
      if (g.code !== 220) return resolve(false);
      const eh = await cmd(`EHLO ${helo}\r\n`);
      if (eh.code !== 250) return resolve(false);
      const a1 = await cmd("AUTH LOGIN\r\n");
      if (a1.code !== 334) return resolve(false);
      const a2 = await cmd(Buffer.from(o.user).toString("base64") + "\r\n");
      if (a2.code !== 334) return resolve(false);
      const a3 = await cmd(Buffer.from(o.pass).toString("base64") + "\r\n");
      if (a3.code !== 235) return resolve(false);
      const mf = await cmd(`MAIL FROM:<${o.from}>\r\n`);
      if (mf.code !== 250) return resolve(false);
      const rc = await cmd(`RCPT TO:<${o.to}>\r\n`);
      if (rc.code !== 250) return resolve(false);
      const dt = await cmd("DATA\r\n");
      if (dt.code !== 354) return resolve(false);
      const msg = buildMimeMessage(o);
      const sent = await cmd(msg);
      if (sent.code !== 250) return resolve(false);
      await cmd("QUIT\r\n");
      resolve(true);
    })();
  });
}

function isAscii(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) > 0x7f) return false;
  }
  return true;
}

function mimeEncode(s: string): string {
  if (isAscii(s)) return s;
  return "=?UTF-8?B?" + Buffer.from(s, "utf8").toString("base64") + "?=";
}

/**
 * Собирает полное MIME-сообщение с заголовками и телом.
 * При наличии вложений используется `multipart/mixed`, иначе — простой text/html.
 */
function buildMimeMessage(o: SmtpOpts): string {
  const boundary = `mixed-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const headers =
    `From: ${mimeEncode(o.fromName)} <${o.from}>\r\n` +
    `To: ${o.to}\r\n` +
    `Subject: ${mimeEncode(o.subject)}\r\n` +
    `MIME-Version: 1.0\r\n`;

  if (!o.attachments.length) {
    return (
      headers +
      `Content-Type: text/html; charset=UTF-8\r\n` +
      `Content-Transfer-Encoding: 8bit\r\n` +
      `\r\n` +
      o.html +
      `\r\n.\r\n`
    );
  }

  const htmlPart =
    `--${boundary}\r\n` +
    `Content-Type: text/html; charset=UTF-8\r\n` +
    `Content-Transfer-Encoding: 8bit\r\n` +
    `\r\n` +
    o.html +
    `\r\n`;

  const attachmentParts = o.attachments
    .map((a) => {
      const safeName = a.filename.replace(/[\r\n"]/g, "_");
      const mimeType = a.mimeType || "application/octet-stream";
      return (
        `--${boundary}\r\n` +
        `Content-Type: ${mimeType}; name="${safeName}"\r\n` +
        `Content-Transfer-Encoding: base64\r\n` +
        `Content-Disposition: attachment; filename="${safeName}"\r\n` +
        `\r\n` +
        chunkBase64Lines(a.contentBase64, 76) +
        `\r\n`
      );
    })
    .join("");

  return (
    headers +
    `Content-Type: multipart/mixed; boundary="${boundary}"\r\n` +
    `\r\n` +
    htmlPart +
    attachmentParts +
    `--${boundary}--\r\n` +
    `.\r\n`
  );
}

/** Разбивает base64-строку на строки по N символов (RFC 2045 требует ≤76). */
function chunkBase64Lines(b64: string, lineLen: number): string {
  if (lineLen <= 0 || b64.length <= lineLen) return b64;
  const out: string[] = [];
  for (let i = 0; i < b64.length; i += lineLen) {
    out.push(b64.slice(i, i + lineLen));
  }
  return out.join("\r\n");
}

export async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    return true;
  } catch {
    return false;
  }
}

export { SUPPORT_EMAIL };
