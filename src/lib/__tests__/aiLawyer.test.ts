import { describe, expect, it } from "vitest";
import {
  AI_FREE_QUESTIONS,
  AI_LOW_BALANCE_KOPEKS,
  AI_MIN_TOPUP_KOPEKS,
  AI_PLAN_PRICE_KOPEKS,
  AI_PLAN_QUESTIONS,
  AI_PRICE_MESSAGE_KOPEKS,
  creditForTopup,
  currentQuotaMonth,
  estimateCostKopeks,
  formatKopeks,
  messagesForTopup,
  resolveQuestionSource,
} from "@/lib/ai/pricing";
import {
  AI_AUDIT_SYSTEM_PROMPT,
  buildAuditUserMessage,
  buildUserMessage,
  checkCitations,
  parseAuditReport,
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
    expect(aiChatSchema.safeParse({ text: "x".repeat(20001), consent: true }).success).toBe(false);
    expect(aiChatSchema.safeParse({ text: "x".repeat(20000), consent: true }).success).toBe(true);
  });

  it("aiChatSchema: mode по умолчанию chat, audit проходит явно", () => {
    const r = aiChatSchema.safeParse({ text: "Что делать при ДТП?", consent: true });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.mode).toBe("chat");
    expect(aiChatSchema.safeParse({ text: "x".repeat(500), mode: "audit", consent: true }).success).toBe(true);
    expect(aiChatSchema.safeParse({ text: "Что делать?", mode: "hack", consent: true }).success).toBe(false);
  });

  it("aiTopupSchema: границы 100–100000", () => {
    expect(aiTopupSchema.safeParse({ amountRub: 100 }).success).toBe(true);
    expect(aiTopupSchema.safeParse({ amountRub: 99 }).success).toBe(false);
    expect(aiTopupSchema.safeParse({ amountRub: 100001 }).success).toBe(false);
  });
});

describe("ai audit", () => {
  const ANSWER =
    'Вот отчёт:\n```json\n{"score": 54, "verdict": "Требуются правки", "summary": "Кабальные условия.", "findings": [{"type": "critical", "clause": "п. 4.2", "title": "Невозвратный залог", "problem": "Риск.", "law": "ст. 381.1 ГК РФ", "fix": "«Возврат за 30 дней.»"}]}\n```';

  it("промпт аудита запрещает нормы по памяти и требует JSON", () => {
    expect(AI_AUDIT_SYSTEM_PROMPT).toContain("```json");
    expect(AI_AUDIT_SYSTEM_PROMPT).toContain("по памяти");
  });

  it("buildAuditUserMessage: текст договора + контекст", () => {
    const msg = buildAuditUserMessage("п. 1. Текст.", [CHUNK]);
    expect(msg).toContain("ТЕКСТ ДОГОВОРА");
    expect(msg).toContain("п. 1. Текст.");
    expect(msg).toContain("ст. 12.37");
  });

  it("parseAuditReport: валидный JSON из блока", () => {
    const r = parseAuditReport(ANSWER);
    expect(r?.score).toBe(54);
    expect(r?.verdict).toBe("Требуются правки");
    expect(r?.findings).toHaveLength(1);
    expect(r?.findings[0].law).toBe("ст. 381.1 ГК РФ");
  });

  it("parseAuditReport: мусор → null", () => {
    expect(parseAuditReport("Просто текст без JSON.")).toBe(null);
    expect(parseAuditReport('{"score": 10}')).toBe(null);
    expect(parseAuditReport("```json\nне json\n```")).toBe(null);
  });

  it("parseAuditReport: score клэмпится, verdict чинится, findings режутся до 8", () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      type: "bogus", clause: "п. " + i, title: "t", problem: "p", law: "l", fix: "f",
    }));
    const r = parseAuditReport(JSON.stringify({ score: 150, verdict: "???", summary: "s", findings: many }));
    expect(r?.score).toBe(100);
    expect(r?.verdict).toBe("Безопасен");
    expect(r?.findings).toHaveLength(8);
    expect(r?.findings[0].type).toBe("warning");
  });
});

describe("ai plan quota", () => {
  it("тариф: 690 ₽, 200 вопросов в месяц", () => {
    expect(AI_PLAN_PRICE_KOPEKS).toBe(69000);
    expect(AI_PLAN_QUESTIONS).toBe(200);
  });

  it("currentQuotaMonth: формат YYYY-MM, детерминирован", () => {
    expect(currentQuotaMonth(new Date(Date.UTC(2026, 8, 26)))).toBe("2026-09");
    expect(currentQuotaMonth(new Date(Date.UTC(2026, 0, 5)))).toBe("2026-01");
  });

  it("resolveQuestionSource: квота первой, затем бесплатные, затем баланс", () => {
    // Есть квота — всегда квота (даже если бесплатные не тронуты).
    expect(resolveQuestionSource({ quotaTotal: 200, quotaUsed: 0, freeAsked: 0 })).toBe("quota");
    expect(resolveQuestionSource({ quotaTotal: 200, quotaUsed: 199, freeAsked: 0 })).toBe("quota");
    // Квота исчерпана (used == total) — падаем на бесплатные/баланс.
    expect(resolveQuestionSource({ quotaTotal: 200, quotaUsed: 200, freeAsked: 0 })).toBe("free");
    expect(resolveQuestionSource({ quotaTotal: 200, quotaUsed: 200, freeAsked: 2 })).toBe("paid");
    // Без тарифа — обычная логика: бесплатные, затем баланс.
    expect(resolveQuestionSource({ quotaTotal: 0, quotaUsed: 0, freeAsked: 0 })).toBe("free");
    expect(resolveQuestionSource({ quotaTotal: 0, quotaUsed: 0, freeAsked: 1 })).toBe("free");
    expect(resolveQuestionSource({ quotaTotal: 0, quotaUsed: 0, freeAsked: 2 })).toBe("paid");
  });
});
