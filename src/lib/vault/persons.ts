// Паспортные и контактные данные лиц — в зашифрованном локальном хранилище.
//
// ДО 30.09.2026 эти данные уходили на сервер открытым текстом через
// `/api/persons` (таблица `persons`): ФИО, дата рождения, телефон, серия и
// номер паспорта, код подразделения, адрес. Специальная категория ПДн по
// 152-ФЗ, и при этом самое чувствительное, что есть в продукте: паспортные
// данные нельзя сменить, в отличие от пароля.
//
// Теперь то же, что и для документов: AES-256-GCM ключом устройства, в
// IndexedDB. Сервер не получает ни поля, ни ключа. Взаимодействие с
// `/api/persons` осталось только для миграции уже сохранённых записей.

import { idbPut, idbGet, idbGetAll, idbDelete, STORE } from "./idb";
import { encryptJSON, decryptJSON, type Envelope } from "./keyManager";

/** Набор полей лица. Совпадает с прежней серверной схемой persons. */
export interface PersonFields {
  fio: string;
  birthday: string;
  phone: string;
  passport_series: string;
  passport_number: string;
  passport_issued_by: string;
  passport_code: string;
  address: string;
  note: string;
}

export interface PersonMeta {
  id: string;
  title: string;
  updatedAt: string;
}

/** Запись в хранилище: метаданные открыты (нужны для списка), содержимое — нет. */
interface PersonRecord extends PersonMeta {
  enc: Envelope;
}

const PERSON_PREFIX = "person:";
const MAX_PERSONS = 200;

export const EMPTY_PERSON: PersonFields = {
  fio: "",
  birthday: "",
  phone: "",
  passport_series: "",
  passport_number: "",
  passport_issued_by: "",
  passport_code: "",
  address: "",
  note: "",
};

function normalize(input: Partial<PersonFields> | null | undefined): PersonFields {
  const s = (v: unknown, max = 500): string =>
    typeof v === "string" ? v.trim().slice(0, max) : "";
  return {
    fio: s(input?.fio),
    birthday: s(input?.birthday, 40),
    phone: s(input?.phone, 60),
    passport_series: s(input?.passport_series, 40),
    passport_number: s(input?.passport_number, 40),
    passport_issued_by: s(input?.passport_issued_by),
    passport_code: s(input?.passport_code, 40),
    address: s(input?.address),
    note: s(input?.note, 1000),
  };
}

function newId(): string {
  return `${PERSON_PREFIX}${crypto.randomUUID()}`;
}

/** Короткая подпись для списка: ФИО, иначе — что заполнено. */
function deriveTitle(p: PersonFields): string {
  if (p.fio) return p.fio;
  const filled = [
    p.passport_number && "паспорт",
    p.phone && "телефон",
    p.address && "адрес",
  ].filter(Boolean);
  return filled.length ? `Без ФИО (${filled.join(", ")})` : "Пустая запись";
}

export async function savePerson(fields: Partial<PersonFields>): Promise<PersonMeta> {
  const clean = normalize(fields);
  if (!clean.fio) throw new Error("Заполните ФИО");
  const now = new Date().toISOString();
  const id = newId();
  const meta: PersonMeta = { id, title: deriveTitle(clean), updatedAt: now };
  const enc = await encryptJSON({ fields: clean });
  await idbPut(STORE.docs, { ...meta, enc } satisfies PersonRecord);
  return meta;
}

export async function listPersonRecords(): Promise<PersonRecord[]> {
  const all = await idbGetAll<{ enc: Envelope } & PersonMeta>(STORE.docs);
  return all
    .filter((r) => typeof r.id === "string" && r.id.startsWith(PERSON_PREFIX))
    .map((r) => ({ id: r.id, title: r.title, updatedAt: r.updatedAt, enc: r.enc }));
}

export interface PersonEntry {
  id: string;
  fields: PersonFields;
}

/** Список лиц с идентификаторами (id нужен для удаления конкретной записи). */
export async function listPersonsWithIds(): Promise<PersonEntry[]> {
  const records = await listPersonRecords();
  const out: PersonEntry[] = [];
  for (const r of records) {
    try {
      const payload = await decryptJSON<{ fields: PersonFields }>(r.enc);
      if (payload?.fields) out.push({ id: r.id, fields: normalize(payload.fields) });
    } catch {
      // Запись не расшифровывается (ключ другой/битая) — пропускаем,
      // чтобы не ломать весь список из одной нечитаемой записи.
    }
  }
  return out;
}

export async function deletePerson(id: string): Promise<void> {
  if (typeof id === "string" && id.startsWith(PERSON_PREFIX)) {
    await idbDelete(STORE.docs, id);
  }
}

/** Удалить всё (используется в миграции, чтобы не оставлять дублей). */
export async function deleteAllPersons(): Promise<number> {
  const records = await listPersonRecords();
  for (const r of records) await idbDelete(STORE.docs, r.id);
  return records.length;
}

export { MAX_PERSONS };
