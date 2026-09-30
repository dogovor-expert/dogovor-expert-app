import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Замок на отключённую автосинхронизацию.
 *
 * 30.09.2026 закрыт путь, который каждые ~30 секунд отправлял содержимое
 * черновика (ФИО, ИНН, паспорт, адреса третьих лиц) на /api/documents
 * методом POST/PATCH — автоматически, без кнопки и без согласия.
 *
 * Тест падает, если кто-то снова включит отправку содержимого: появление
 * нового вызова fetch с POST/PATCH на /api/documents, либо canSync(),
 * начавший возвращать true.
 */

const fetchMock = vi.fn();

describe("автосинхронизация документов отключена", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("canSync() всегда false, даже если пользователь вошёл в аккаунт", async () => {
    (window as unknown as Record<string, unknown>).__DOGOVOR_USER__ = true;
    const { canSync, setUserFlag } = await import("@/lib/sync");
    setUserFlag(true);
    expect(canSync()).toBe(false);
  });

  it("syncDraft не отправляет содержимое на сервер", async () => {
    (window as unknown as Record<string, unknown>).__DOGOVOR_USER__ = true;
    const { syncDraft, setUserFlag } = await import("@/lib/sync");
    setUserFlag(true);

    const result = await syncDraft({
      templateId: "dkp-auto",
      values: { fio: "Иванов Иван Иванович", inn: "123456789012" },
      checklist: {},
      activeTab: "",
      savedAt: new Date().toISOString(),
    });

    expect(result).toBe(false);
    // Ни одного сетевого вызова: данные остаются на устройстве.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("syncDraft остаётся no-op при любом числе вызовов", async () => {
    const { syncDraft } = await import("@/lib/sync");
    const d = {
      templateId: "rental",
      values: { passport: "45 12 345678" },
      checklist: {},
      activeTab: "",
      savedAt: new Date().toISOString(),
    };
    await Promise.all([syncDraft(d), syncDraft(d), syncDraft(d)]);
    const writes = fetchMock.mock.calls.filter(([, init]) =>
      ["POST", "PATCH", "PUT"].includes((init as RequestInit | undefined)?.method as string),
    );
    expect(writes).toHaveLength(0);
  });

  it("syncDelete по-прежнему стирает серверную копию (миграция должна работать)", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ id: "doc-1", template_id: "rental" }] }),
    } as unknown as Response);
    fetchMock.mockResolvedValueOnce({ ok: true } as unknown as Response);

    const { syncDelete } = await import("@/lib/sync");
    const ok = await syncDelete("rental");

    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("/api/documents");
    expect(fetchMock).toHaveBeenCalledWith("/api/documents/doc-1", {
      method: "DELETE",
    });
  });
});
