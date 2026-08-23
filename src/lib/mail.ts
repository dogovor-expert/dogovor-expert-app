import { SUPPORT_EMAIL } from "@/lib/site";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const zeptoToken = process.env.ZEPTOMAIL_TOKEN;
  const resendKey = process.env.RESEND_API_KEY;
  if (!zeptoToken && !resendKey) return false;

  const fromRaw = process.env.EMAIL_FROM || "no-reply@dogovor.expert";
  const fromName = process.env.EMAIL_FROM_NAME || "Dogovor.expert";

  try {
    if (zeptoToken) {
      await fetch("https://api.zeptomail.com/v1.1/email/single", {
        method: "POST",
        headers: { Authorization: `Zoho-enczapikey ${zeptoToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: { address: fromRaw, name: fromName },
          to: [{ email_address: { address: to } }],
          subject,
          htmlbody: html,
        }),
      });
    } else {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `${fromName} <${fromRaw}>`,
          to: [to],
          subject,
          html,
        }),
      });
    }
    return true;
  } catch {
    return false;
  }
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
