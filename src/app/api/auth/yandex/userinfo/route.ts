import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Нормалайзер userinfo для Яндекс-провайдера self-hosted GoTrue.
 *
 * GoTrue разбирает ответ провайдера в типизированную структуру `Claims` и затем
 * применяет `attribute_mapping` к ключам ЭТОЙ структуры. Полей `default_email`,
 * `id`, `display_name` в `Claims` нет, поэтому маппинг `email ← default_email`
 * не срабатывает и GoTrue падает с 500 «Error getting user email from external
 * provider». Апгрейд GoTrue это не чинит (`applyAttributeMapping` не изменён).
 *
 * Яндекс не поддерживает OIDC (`/.well-known/openid-configuration` отдаёт HTML,
 * `login.yandex.ru/userinfo` — 404), а поле `email` присутствует только в
 * `format=jwt`. Поэтому этот роут ставится GoTrue как `userinfo_url`: он
 * проксирует запрос в `login.yandex.ru/info?format=json` (тот же Authorization,
 * что прислал GoTrue) и возвращает обычный JSON с именами полей, которые
 * `Claims` понимает напрямую, — без `attribute_mapping`.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  let profile: Record<string, unknown>;
  try {
    const res = await fetch("https://login.yandex.ru/info?format=json", {
      headers: { Authorization: auth },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ error: "provider_error" }, { status: 502 });
    }
    profile = (await res.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "provider_unreachable" }, { status: 502 });
  }

  const id = profile.id;
  const email =
    typeof profile.default_email === "string" && profile.default_email.length > 0
      ? profile.default_email
      : Array.isArray(profile.emails) && typeof profile.emails[0] === "string"
        ? profile.emails[0]
        : undefined;

  if (id === undefined || id === null || typeof email !== "string" || email.length === 0) {
    return NextResponse.json({ error: "email_unavailable" }, { status: 422 });
  }

  const name =
    (typeof profile.display_name === "string" && profile.display_name) ||
    (typeof profile.real_name === "string" && profile.real_name) ||
    (typeof profile.login === "string" && profile.login) ||
    undefined;
  const avatarId =
    typeof profile.default_avatar_id === "string" ? profile.default_avatar_id : undefined;

  return NextResponse.json(
    {
      sub: typeof id === "string" ? id : typeof id === "number" ? String(id) : "",
      email,
      email_verified: true, // Яндекс отдаёт только подтверждённые адреса
      name,
      given_name: typeof profile.first_name === "string" ? profile.first_name : undefined,
      family_name: typeof profile.last_name === "string" ? profile.last_name : undefined,
      preferred_username: typeof profile.login === "string" ? profile.login : undefined,
      picture: avatarId
        ? `https://avatars.yandex.net/get-yapic/${avatarId}/islands-200`
        : undefined,
    },
    { headers: { "cache-control": "no-store" } }
  );
}
