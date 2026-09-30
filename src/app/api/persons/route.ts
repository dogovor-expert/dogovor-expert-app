import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";

/**
 * Паспортные данные больше не принимаются и не отдаются новому коду.
 *
 * Здесь хранились ФИО, дата рождения, телефон, серия и номер паспорта,
 * код подразделения, кто выдал, адрес — открытым текстом, в таблице
 * `persons`. Это специальная категория персональных данных по 152-ФЗ и
 * самое чувствительное в продукте: паспортные данные, в отличие от пароля,
 * нельзя сменить.
 *
 * С 30.09.2026 лицо хранится в зашифрованном локальном хранилище
 * (src/lib/vault/persons.ts): AES-256-GCM ключом устройства, в IndexedDB.
 * Оператор не получает ни полей, ни ключа.
 *
 * Что осталось намеренно — только для разовой миграции уже сохранённых
 * записей, и только чтение и удаление:
 *   GET    — клиент читает старые записи, шифрует их локально;
 *   DELETE — удаляет серверную копию ПОСЛЕ того, как копия легла в vault.
 * Порядок в клиенте соблюдён: при ошибке шифрования запись с сервера
 * не удаляется, чтобы не потерять данные с обеих сторон.
 *
 * POST закрыт: новые паспортные данные на сервер не попадают никогда.
 */

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("persons")
    .select("id, fio, birthday, phone, passport_series, passport_number, passport_issued_by, passport_code, address, note, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

async function deleteHandler(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const { error } = await supabase
    .from("persons")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export const DELETE = withCsrf(deleteHandler);

/** ⛔ Создание записей на сервере запрещено. */
async function postHandler(_req: NextRequest) {
  return NextResponse.json(
    {
      error: "deprecated",
      message:
        "Сохранение паспортных данных на сервере отключено. Они шифруются на вашем устройстве и хранятся в защищённом хранилище браузера.",
    },
    { status: 410 },
  );
}

export const POST = withCsrf(postHandler);
