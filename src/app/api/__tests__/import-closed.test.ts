import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Замок на закрытый эндпоинт загрузки документов.
 *
 * 30.09.2026 POST /api/import закрыт: содержимое документов больше не
 * уходит на сервер. Эндпоинт должен отвечать 410 и не обращаться к базе —
 * ни записи, ни чтения. Тест ломается, если кто-то снова откроет загрузку.
 */

const fromMock = vi.fn();
const insertMock = vi.fn();
const upsertMock = vi.fn();
const rpcMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: "u1" } } })) },
    from: fromMock,
  })),
}));

vi.mock("@/lib/csrf", () => ({
  withCsrf: (fn: unknown) => fn,
}));

import { POST } from "@/app/api/import/route";

describe("POST /api/import — закрыт", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fromMock.mockReturnValue({
      insert: insertMock,
      upsert: upsertMock,
      select: vi.fn(),
    });
    rpcMock.mockResolvedValue({ data: null });
  });

  it("отвечает 410 Gone с понятным объяснением", async () => {
    const res = await POST(
      new Request("https://dogovor.expert/api/import", {
        method: "POST",
        body: JSON.stringify({ drafts: [{ templateId: "dkp-auto", values: {} }] }),
      }),
    );
    expect(res.status).toBe(410);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe("deprecated");
    expect(body.message).toMatch(/шифруются на вашем устройстве/i);
  });

  it("не обращается к базе: содержимое не сохраняется на сервере", async () => {
    await POST(
      new Request("https://dogovor.expert/api/import", {
        method: "POST",
        body: JSON.stringify({
          drafts: [
            {
              templateId: "dkp-auto",
              // Имитируем реальные персональные данные — они не должны
              // никуда уйти, даже если обработчик снова откроют.
              values: { fio: "Иванов Иван Иванович", inn: "123456789012" },
            },
          ],
        }),
      }),
    );
    expect(insertMock).not.toHaveBeenCalled();
    expect(upsertMock).not.toHaveBeenCalled();
    expect(fromMock).not.toHaveBeenCalled();
  });
});
