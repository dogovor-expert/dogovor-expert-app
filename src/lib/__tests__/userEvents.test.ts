import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({ insert: insertMock }),
  }),
}));

const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });

import { logUserEvent, isKnownEvent, deviceFromUserAgent } from "@/lib/userEvents";

describe("userEvents / isKnownEvent", () => {
  it("принимает события из каталога", () => {
    expect(isKnownEvent("builder_start")).toBe(true);
    expect(isKnownEvent("export_pdf")).toBe(true);
  });

  it("отклоняет произвольные строки", () => {
    expect(isKnownEvent("drop_table_users")).toBe(false);
    expect(isKnownEvent("")).toBe(false);
    // Object.prototype-геттеры не должны давать false positive.
    expect(isKnownEvent("hasOwnProperty")).toBe(false);
    expect(isKnownEvent("toString")).toBe(false);
  });
});

describe("userEvents / deviceFromUserAgent", () => {
  it("определяет мобильные устройства", () => {
    expect(deviceFromUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")).toBe("mobile");
    expect(deviceFromUserAgent("Mozilla/5.0 (Linux; Android 14)")).toBe("mobile");
  });

  it("определяет планшеты", () => {
    expect(deviceFromUserAgent("Mozilla/5.0 (iPad; CPU OS 17_0)")).toBe("tablet");
  });

  it("по умолчанию — desktop", () => {
    expect(deviceFromUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
    expect(deviceFromUserAgent(null)).toBe("desktop");
  });
});

describe("userEvents / logUserEvent meta-санитизация (главная защита от утечки ПДн)", () => {
  beforeEach(() => {
    insertMock.mockClear();
  });

  it("пропускает разрешённые ключи из каталога события", async () => {
    await logUserEvent({
      event: "builder_start",
      sessionId: "session-1234567890",
      meta: { template: "dkp-auto", source: "url" },
    });
    const inserted = insertMock.mock.calls[0][0];
    expect(inserted.meta).toEqual({ template: "dkp-auto", source: "url" });
  });

  it("отбрасывает значение вне enum, но сохраняет остальные валидные ключи", async () => {
    await logUserEvent({
      event: "builder_start",
      sessionId: "session-1234567890",
      meta: { template: "dkp-auto", source: "hacked_source" },
    });
    const inserted = insertMock.mock.calls[0][0];
    expect(inserted.meta).toEqual({ template: "dkp-auto" });
  });

  it("НИКОГДА не пропускает ключи, не описанные в каталоге события — главный тест-инвариант", async () => {
    await logUserEvent({
      event: "builder_start",
      sessionId: "session-1234567890",
      meta: {
        template: "dkp-auto",
        // Попытка протащить ПДн через произвольный ключ — должна быть отброшена.
        seller_fio: "Иванов Иван Иванович",
        seller_passport: "4510 123456",
        seller_inn: "770123456789",
        email: "victim@example.com",
      },
    });
    const inserted = insertMock.mock.calls[0][0];
    expect(inserted.meta).toEqual({ template: "dkp-auto" });
    expect(inserted.meta).not.toHaveProperty("seller_fio");
    expect(inserted.meta).not.toHaveProperty("seller_passport");
    expect(inserted.meta).not.toHaveProperty("seller_inn");
    expect(inserted.meta).not.toHaveProperty("email");
  });

  it("для события без описанной схемы meta — meta всегда null, что бы ни прислали", async () => {
    await logUserEvent({
      event: "page_view", // в каталоге у page_view нет ключа meta вообще
      sessionId: "session-1234567890",
      meta: { anything: "should be dropped", fio: "Петров Пётр" },
    });
    const inserted = insertMock.mock.calls[0][0];
    expect(inserted.meta).toBeNull();
  });

  it("обрезает длинные строковые значения", async () => {
    await logUserEvent({
      event: "builder_start",
      sessionId: "session-1234567890",
      meta: { template: "x".repeat(500) },
    });
    const inserted = insertMock.mock.calls[0][0];
    expect((inserted.meta.template as string).length).toBe(200);
  });

  it("ограничивает число ключей в meta", async () => {
    // audit_run разрешает только template/errors — лишние поля не считаются,
    // но проверяем, что общий лимит ключей защищает и произвольно большие payload.
    const bigMeta: Record<string, string> = {};
    for (let i = 0; i < 50; i++) bigMeta[`key${i}`] = "v";
    await logUserEvent({ event: "audit_run", sessionId: "session-1234567890", meta: bigMeta });
    const inserted = insertMock.mock.calls[0][0];
    expect(inserted.meta).toBeNull(); // ни один ключ не входит в разрешённые для audit_run
  });

  it("никогда не бросает, даже если insert падает", async () => {
    insertMock.mockRejectedValueOnce(new Error("db down"));
    await expect(
      logUserEvent({ event: "page_view", sessionId: "s" })
    ).resolves.toBeUndefined();
  });

  it("не падает на meta не-объекте (строка/число/массив)", async () => {
    await expect(
      logUserEvent({ event: "builder_start", sessionId: "s", meta: "не объект" })
    ).resolves.toBeUndefined();
    const inserted = insertMock.mock.calls[0][0];
    expect(inserted.meta).toBeNull();
  });
});
