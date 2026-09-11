import { describe, expect, it } from "vitest";
import { shouldUseServerOcr, type OcularStatus } from "@/lib/ocrStatus";

const available: OcularStatus = { available: true, reason: "ok" };
const offline: OcularStatus = { available: false, reason: "network_error" };

describe("shouldUseServerOcr (TICKET-1, 152-ФЗ opt-in)", () => {
  it("сервер доступен + согласие есть → серверный OCR", () => {
    expect(shouldUseServerOcr(available, true)).toBe(true);
  });

  it("сервер доступен, согласия нет → НЕ отправляем фото", () => {
    expect(shouldUseServerOcr(available, false)).toBe(false);
  });

  it("согласие есть, но сервер недоступен → базовый режим", () => {
    expect(shouldUseServerOcr(offline, true)).toBe(false);
  });

  it("статус ещё не получен (null) → базовый режим", () => {
    expect(shouldUseServerOcr(null, true)).toBe(false);
    expect(shouldUseServerOcr(null, false)).toBe(false);
  });
});
