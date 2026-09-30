import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  DATA_FLOWS,
  LOCATION_LABEL,
  LOCATION_HINT,
  BROWSER_FLOW_COUNT,
  SERVER_FLOW_COUNT,
} from "@/data/data-flows";

const projectRoot = process.cwd();
const read = (p: string) => readFileSync(path.join(projectRoot, p), "utf8");

/**
 * Инварианты раскрытия обработки персональных данных.
 *
 * Смысл: сайт обещает «данные документов остаются в браузере», и это
 * обещание юридически значимо. Таблица в src/data/data-flows.ts — единственный
 * источник правды, и её должны защищать проверки, иначе текст разойдётся с
 * кодом (ровно так появились несуществующие цены «от 14 ₽» и 990 ₽).
 *
 * Требования Рособрнадзора к содержанию политики (Приложение к приказу
 * ФСТЭК/Роскомнадзора), которые здесь проверяются: состав и цели обработки,
 * категории субъектов, взаимодействие с третьими лицами, сроки хранения.
 */
describe("Раскрытие обработки персональных данных", () => {
  it("список операций не пуст", () => {
    expect(DATA_FLOWS.length).toBeGreaterThanOrEqual(10);
  });

  it("у каждой операции описано, что передаётся", () => {
    for (const f of DATA_FLOWS) {
      expect(f.operation, "operation").toBeTruthy();
      expect(f.detail.length, f.operation).toBeGreaterThan(20);
    }
  });

  it("у каждой операции указан срок хранения", () => {
    // Роскомнадзор требует указывать сроки хранения персональных данных.
    for (const f of DATA_FLOWS) {
      expect(f.retention, f.operation).toBeTruthy();
      expect(f.retention.length, f.operation).toBeGreaterThan(5);
    }
  });

  it("операции вне браузера объясняют, зачем нужна передача", () => {
    for (const f of DATA_FLOWS) {
      if (f.where === "browser") continue;
      expect(f.why, `${f.operation}: нужен обоснующий текст`).toBeTruthy();
      expect(f.why!.length, f.operation).toBeGreaterThan(20);
    }
  });

  it("операции в браузере не обещают срок хранения сервера", () => {
    for (const f of DATA_FLOWS.filter((x) => x.where === "browser")) {
      expect(f.retention.toLowerCase(), f.operation).toContain("не сохраня");
    }
  });

  it("строки с передачей данных помечены как требующие согласия или срока", () => {
    for (const f of DATA_FLOWS.filter((x) => x.where !== "browser")) {
      // Либо явное согласие, либо конкретный срок хранения — иначе операция
      // выглядит как бессрочный сбор.
      expect(
        f.consent === true || f.retention.length > 20,
        `${f.operation}: нужно согласие или подробный срок`
      ).toBe(true);
    }
  });

  it("у каждого места обработки есть подпись и пояснение", () => {
    for (const loc of ["browser", "server", "thirdParty"] as const) {
      expect(LOCATION_LABEL[loc]).toBeTruthy();
      expect(LOCATION_HINT[loc].length).toBeGreaterThan(20);
    }
  });

  it("счётчики в интерфейсе согласованы со списком", () => {
    expect(BROWSER_FLOW_COUNT + SERVER_FLOW_COUNT).toBe(DATA_FLOWS.length);
    expect(BROWSER_FLOW_COUNT).toBeGreaterThan(0);
    expect(SERVER_FLOW_COUNT).toBeGreaterThan(0);
  });

  it("названия операций уникальны", () => {
    const names = DATA_FLOWS.map((f) => f.operation);
    expect(new Set(names).size).toBe(names.length);
  });

  it("политика конфиденциальности ссылается на перечень и упоминает чат", () => {
    const privacy = read("src/app/privacy/page.tsx");
    // Раздел с перечнем обязан существовать — иначе раскрытие не видно
    // пользователю, хотя данные в интерфейсе перечислены.
    expect(privacy).toContain("2.3.");
    expect(privacy).toContain("DataFlowPanel");
    // Вложения чата — единственная операция, где файл попадает на наш сервер
    // по инициативе пользователя, её обязательно надо назвать в политике.
    expect(privacy).toContain("Вложения в чате поддержки");
    // Срок хранения вложений должен совпадать с кодом (CHAT_FILE_TTL = 30 дней).
    expect(privacy).toContain("30 дней");
  });

  it("срок удаления вложений чата задан в коде и политится кроном", () => {
    const chatFiles = read("src/lib/chat-files.ts");
    expect(chatFiles).toContain("CHAT_FILE_TTL");
    // Функция удаления обязана существовать: без неё объявленный срок
    // хранения — пустое обещание.
    expect(chatFiles).toContain("deleteExpiredChatFiles");

    const cron = read("src/app/api/cron/daily-maintenance/route.ts");
    expect(cron).toContain("purgeExpiredChatFiles");
  });
});
