import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * Замок на закрытую запись паспортных данных.
 *
 * Паспорт — специальная категория ПДн по 152-ФЗ, и в отличие от пароля его
 * нельзя сменить. До 30.09.2026 POST /api/persons писал ФИО, дату рождения,
 * серию и номер паспорта, код подразделения и адрес открытым текстом.
 *
 * Тест падает, если запись снова откроют.
 */

const fromMock = vi.fn();
const insertMock = vi.fn();
const upsertMock = vi.fn();
const updateMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: "u1" } } })) },
    from: fromMock,
  })),
}));
vi.mock("@/lib/csrf", () => ({ withCsrf: (fn: unknown) => fn }));

import { POST } from "@/app/api/persons/route";

describe("POST /api/persons — закрыт", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fromMock.mockReturnValue({
      insert: insertMock,
      upsert: upsertMock,
      update: updateMock,
      select: vi.fn(),
    });
  });

  it("отвечает 410 Gone и не принимает паспортные данные", async () => {
    const res = await POST(
      new NextRequest("https://dogovor.expert/api/persons", {
        method: "POST",
        body: JSON.stringify({
          fio: "Иванов Иван Иванович",
          passport_series: "45 08",
          passport_number: "123456",
          passport_code: "770-053",
        }),
      }),
    );
    expect(res.status).toBe(410);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe("deprecated");
    expect(body.message).toMatch(/шифруются на вашем устройстве/i);
  });

  it("не обращается к базе: паспортные данные никуда не пишутся", async () => {
    await POST(
      new NextRequest("https://dogovor.expert/api/persons", {
        method: "POST",
        body: JSON.stringify({ fio: "Петров Пётр Петрович", passport_number: "999888" }),
      }),
    );
    expect(insertMock).not.toHaveBeenCalled();
    expect(upsertMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
    expect(fromMock).not.toHaveBeenCalled();
  });
});
