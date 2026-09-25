import { describe, expect, it } from "vitest";
import {
  AI_FREE_QUESTIONS,
  AI_LOW_BALANCE_KOPEKS,
  AI_MIN_TOPUP_KOPEKS,
  AI_PRICE_MESSAGE_KOPEKS,
  creditForTopup,
  estimateCostKopeks,
  formatKopeks,
  messagesForTopup,
} from "@/lib/ai/pricing";
import {
  buildUserMessage,
  checkCitations,
  type LawChunk,
} from "@/lib/ai/prompt";
import { aiChatSchema, aiTopupSchema } from "@/lib/validations/api";

const CHUNK: LawChunk = {
  id: 1,
  code: "КоАП РФ",
  article: "ст. 12.37",
  chunk: "Неисполнение обязанности по страхованию влечёт штраф 800 рублей.",
  edition_date: "2026-01-01",
};

describe("ai pricing", () => {
  it("фиксированная цена сообщения 19 ₽", () => {
    expect(AI_PRICE_MESSAGE_KOPEKS).toBe(1900);
    expect(formatKopeks(AI_PRICE_MESSAGE_KOPEKS)).toBe("19 ₽");
  });

  it("себестоимость V4 Flash: 3000 вх + 1000 исх = 10 копеек", () => {
    expect(estimateCostKopeks(3000, 1000)).toBe(10);
  });

  it("округление вверх защищает от ухода в минус", () => {
    expect(estimateCostKopeks(1, 1)).toBe(6);
    expect(estimateCostKopeks(0, 0)).toBe(0);
  });

  it("пороги: мин. пополнение 100 ₽, low-balance 20 ₽, free = 2", () => {
    expect(AI_MIN_TOPUP_KOPEKS).toBe(10000);
    expect(AI_LOW_BALANCE_KOPEKS).toBe(2000);
    expect(AI_FREE_QUESTIONS).toBe(2);
  });

  it("бонусы пополнения: 100→0%, 300→10%, 500→20%, 1000→30%", () => {
    expect(creditForTopup(100)).toEqual({ creditKopeks: 10000, bonusKopeks: 0 });
    expect(creditForTopup(300)).toEqual({ creditKopeks: 33000, bonusKopeks: 3000 });
    expect(creditForTopup(500)).toEqual({ creditKopeks: 60000, bonusKopeks: 10000 });
    expect(creditForTopup(1000)).toEqual({ creditKopeks: 130000, bonusKopeks: 30000 });
    // Порог срабатывает с точной суммы
    expect(creditForTopup(299).bonusKopeks).toBe(0);
    expect(creditForTopup(1000).bonusKopeks).toBe(30000);
  });

  it("messagesForTopup: 100→5, 300→17, 500→31, 1000→68", () => {
    expect(messagesForTopup(100)).toBe(5);
    expect(messagesForTopup(300)).toBe(17);
    expect(messagesForTopup(500)).toBe(31);
    expect(messagesForTopup(1000)).toBe(68);
  });
});

describe("ai prompt", () => {
  it("без чанков — честный режим: вопрос + пометка об отсутствии контекста", () => {
    const msg = buildUserMessage("Что делать?", []);
    expect(msg).toContain("Что делать?");
    expect(msg).toContain("КОНТЕКСТ");
  });

  it("с чанками — контекст со статьёй и редакцией", () => {
    const msg = buildUserMessage("Штраф?", [CHUNK]);
    expect(msg).toContain("КоАП РФ");
    expect(msg).toContain("ст. 12.37");
    expect(msg).toContain("2026-01-01");
  });

  it("checkCitations: ссылки из контекста → high", () => {
    expect(checkCitations("По ст. 12.37 КоАП штраф 800 рублей.", [CHUNK])).toBe("high");
  });

  it("checkCitations: ссылки вне контекста → low (галлюцинация)", () => {
    expect(checkCitations("По ст. 158 УК РФ наказание…", [CHUNK])).toBe("low");
  });

  it("checkCitations: пустой контекст + ссылки → low", () => {
    expect(checkCitations("По ст. 12.37 КоАП штраф.", [])).toBe("low");
  });

  it("checkCitations: без ссылок → high", () => {
    expect(checkCitations("Обратитесь в ГИБДД с заявлением.", [])).toBe("high");
  });
});

describe("ai validations", () => {
  it("aiChatSchema: валидный вопрос проходит", () => {
    const r = aiChatSchema.safeParse({ text: "Что делать при ДТП?", consent: true });
    expect(r.success).toBe(true);
  });

  it("aiChatSchema: без согласия — отказ", () => {
    const r = aiChatSchema.safeParse({ text: "Что делать?" });
    expect(r.success).toBe(false);
  });

  it("aiChatSchema: null threadId (новый чат из UI) проходит", () => {
    const r = aiChatSchema.safeParse({ text: "Что делать при ДТП?", threadId: null, consent: true });
    expect(r.success).toBe(true);
  });

  it("aiChatSchema: невалидный threadId — отказ", () => {
    expect(aiChatSchema.safeParse({ text: "Что делать?", threadId: "не-uuid", consent: true }).success).toBe(false);
  });

  it("aiChatSchema: пустой и слишком длинный — отказ", () => {
    expect(aiChatSchema.safeParse({ text: "x", consent: true }).success).toBe(false);
    expect(aiChatSchema.safeParse({ text: "x".repeat(4001), consent: true }).success).toBe(false);
  });

  it("aiTopupSchema: границы 100–100000", () => {
    expect(aiTopupSchema.safeParse({ amountRub: 100 }).success).toBe(true);
    expect(aiTopupSchema.safeParse({ amountRub: 99 }).success).toBe(false);
    expect(aiTopupSchema.safeParse({ amountRub: 100001 }).success).toBe(false);
    expect(aiTopupSchema.safeParse({ amountRub: 99.5 }).success).toBe(false);
  });
});
