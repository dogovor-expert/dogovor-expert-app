import { describe, it, expect } from "vitest";
import { declineFullName, looksLikeFullName } from "@/lib/names";

describe("declineFullName", () => {
  it("мужское ФИО: родительный", () => {
    expect(declineFullName("Иванов Иван Иванович", "gen")).toBe("Иванова Ивана Ивановича");
  });

  it("мужское ФИО: творительный", () => {
    expect(declineFullName("Иванов Иван Иванович", "ins")).toBe("Ивановым Иваном Ивановичем");
  });

  it("женское ФИО: родительный", () => {
    expect(declineFullName("Смирнова Ольга Андреевна", "gen")).toBe("Смирновой Ольги Андреевны");
  });

  it("женское ФИО: творительный", () => {
    expect(declineFullName("Смирнова Ольга Андреевна", "ins")).toBe("Смирновой Ольгой Андреевной");
  });

  it("фамилия на -й: родительный", () => {
    expect(declineFullName("Петров Алексей Николаевич", "gen")).toBe("Петрова Алексея Николаевича");
  });

  it("мало слов — возврат как есть", () => {
    expect(declineFullName("Иванов", "gen")).toBe("Иванов");
  });

  it("не-ФИО строка — возврат как есть", () => {
    expect(declineFullName("", "gen")).toBe("");
  });
});

describe("looksLikeFullName", () => {
  it("2-3 слова с заглавной буквы — true", () => {
    expect(looksLikeFullName("Иванов Иван Иванович")).toBe(true);
    expect(looksLikeFullName("Иванов Иван")).toBe(true);
  });

  it("строчные буквы — false", () => {
    expect(looksLikeFullName("иванов иван")).toBe(false);
  });

  it("одно слово — false", () => {
    expect(looksLikeFullName("Иванов")).toBe(false);
  });

  it("латиница — false", () => {
    expect(looksLikeFullName("Ivan Ivanov")).toBe(false);
  });
});
