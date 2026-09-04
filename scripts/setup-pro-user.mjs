// Готовит тестового PRO-пользователя на проде dogovor.expert и пишет
// storage-state для Playwright (supabase auth-сессия в localStorage).
//
// Использование:
//   node scripts/setup-pro-user.mjs --email <email> --password <password> --out <storage-state.json>
//
// Требует env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
//   - создаёт пользователя в auth.users (если нет)
//   - инсертит/обновляет активную PRO-подписку (status=active, period_end на +90 дней)
//   - получает access/refresh токены через grant_type=password
//   - пишет storage-state.json (формат Playwright), в котором localStorage
//     содержит sb-<ref>-auth-token — так Playwright «залогинен».
import { createClient } from "@supabase/supabase-js";
import { writeFile } from "node:fs/promises";

function arg(name, fallback = undefined) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const email = arg("--email");
const password = arg("--password");
const out = arg("--out") || "storage-state.json";
if (!email || !password) {
  console.error("❌ Нужен --email и --password");
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRole) {
  console.error("❌ Нужны env SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!ref) {
  console.error("❌ Не удалось определить ref из SUPABASE_URL");
  process.exit(1);
}

const admin = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. Создать или получить пользователя
let userId = null;

async function signUpNew() {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) return { data: null, error };
  return { data: data.user, error: null };
}

// Сначала ищем по email (admin.listUsers фильтр по email)
const { data: listData, error: listErr } = await admin.auth.admin.listUsers();
if (listErr) {
  // fallback: если listUsers не дал фильтра, попробуем просто создать
  const { data, error } = await signUpNew();
  if (error) {
    console.error("❌ createUser:", error.message);
    process.exit(1);
  }
  userId = data.id;
} else {
  const existing = (listData?.users ?? []).find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    console.log(`ℹ️ Пользователь уже есть: ${existing.id}`);
    userId = existing.id;
  } else {
    const { data, error } = await signUpNew();
    if (error) {
      console.error("❌ createUser:", error.message);
      process.exit(1);
    }
    userId = data.id;
    console.log(`✅ Создан пользователь: ${userId}`);
  }
}

// 2. Убедиться, что у него есть профиль (profiles insert/upsert)
const { error: profErr } = await admin.from("profiles").upsert(
  { id: userId, email, full_name: "Тест PRO E2E" },
  { onConflict: "id" }
);
if (profErr && !/duplicate|already exists/i.test(profErr.message)) {
  console.log(`⚠️ profiles upsert: ${profErr.message}`);

  // На случай строгой схемы — попробуем без full_name/email
  const { error: profErr2 } = await admin.from("profiles").upsert(
    { id: userId },
    { onConflict: "id" }
  );
  if (profErr2 && !/duplicate|already exists/i.test(profErr2.message)) {
    console.log(`⚠️ profiles upsert (min): ${profErr2.message}`);
  }
}

// 3. PRO-подписка: status=active, period_end +90d
const end = new Date(Date.now() + 90 * 86400000).toISOString();
const now = new Date().toISOString();
{
  // пытаемся update; если не затронул — insert
  const { data: upd, error: updErr, count } = await admin
    .from("subscriptions")
    .update({ plan: "pro", status: "active", period_end: end, auto_renewal: false })
    .eq("user_id", userId)
    .select("id");
  if (upd && upd.length > 0) {
    console.log(`✅ Обновлена подписка пользователя: ${upd[0].id}`);
  } else {
    const { data: ins, error: insErr } = await admin
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan: "pro",
        status: "active",
        period_start: now,
        period_end: end,
        auto_renewal: false,
        yookassa_payment_method_id: null,
      })
      .select("id");
    if (insErr) console.error("❌ insert subscription:", insErr.message);
    else console.log(`✅ Создана подписка: ${ins[0].id}`);
  }
}

// 4. Получить auth-сессию (grant_type=password)
const { data: tokenData, error: tokenErr } = await admin.auth.signInWithPassword({
  email,
  password,
});
if (tokenErr) {
  console.error("❌ signInWithPassword:", tokenErr.message);
  process.exit(1);
}
const session = tokenData.session;
if (!session) {
  console.error("❌ Нет session");
  process.exit(1);
}

// 5. Сформировать storage-state (Playwright): localStorage с sb-<ref>-auth-token
const storageKey = `sb-${ref}-auth-token`;
const storageValue = JSON.stringify({
  access_token: session.access_token,
  refresh_token: session.refresh_token,
  expires_at: session.expires_at ? Date.now() + session.expires_in * 1000 : undefined,
  expires_in: session.expires_in,
  token_type: "bearer",
  user: session.user,
});

const storageState = {
  cookies: [
    {
      name: storageKey,
      value: storageValue,
      domain: "dogovor.expert",
      path: "/",
      expires: -1,
      httpOnly: false,
      secure: true,
      sameSite: "Lax",
    },
  ],
  origins: [
    {
      origin: "https://dogovor.expert",
      localStorage: [{ name: storageKey, value: storageValue }],
    },
  ],
};

await writeFile(out, JSON.stringify(storageState, null, 2), "utf8");
console.log(`✅ storage-state записан: ${out}`);
console.log(`   user_id=${userId}`);
console.log(`   PRO до: ${end}`);
console.log(`   Добавь в скрипт: --state ${out}`);
