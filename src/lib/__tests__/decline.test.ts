import { describe, it, expect } from "vitest";
import { declineFullFio } from "@/lib/decline";

describe("declineFullFio", () => {
  it("склоняет все падежи для мужского ФИО", () => {
    const cases = declineFullFio("Иванов Иван Иванович");
    expect(cases.nom).toBe("Иванов Иван Иванович");
    expect(cases.gen).toBe("Иванова Ивана Ивановича");
    expect(cases.dat).toBe("Иванову Ивану Ивановичу");
    expect(cases.ins).toBe("Ивановым Иваном Ивановичем");
  });

  it("склоняет женское ФИО", () => {
    const cases = declineFullFio("Смирнова Ольга Андреевна");
    expect(cases.gen).toBe("Смирновой Ольги Андреевны");
    expect(cases.ins).toBe("Смирновой Ольгой Андреевной");
  });

  it("не-ФИО возвращает без изменений", () => {
    expect(declineFullFio("").gen).toBe("");
  });
});
