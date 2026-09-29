import { describe, it, expect } from "vitest";
import { faqForDocument, faqJsonLd } from "@/lib/seo/faq";
import { LEGAL_TEMPLATES } from "@/data/templates";

describe("faqForDocument: пер-документный FAQ", () => {
  it("возвращает 4 непустых вопроса/ответа", () => {
    for (const t of LEGAL_TEMPLATES.slice(0, 20)) {
      const faq = faqForDocument(t);
      expect(faq, t.id).toHaveLength(4);
      for (const f of faq) {
        expect(f.q.length, t.id).toBeGreaterThan(10);
        expect(f.a.length, t.id).toBeGreaterThan(30);
      }
    }
  });

  it("вопросы содержат имя документа (пер-документная уникальность)", () => {
    const t = LEGAL_TEMPLATES[0];
    const faq = faqForDocument(t);
    expect(faq[0].q).toContain(t.name);
    expect(faq[1].q).toContain(t.name);
    expect(faq[3].q).toContain(t.name);
  });

  it("первые два ответа уникальны по всем 570 шаблонам (нет дублей категории)", () => {
    const seenQ1 = new Set<string>();
    const seenA1 = new Set<string>();
    const seenA2 = new Set<string>();
    for (const t of LEGAL_TEMPLATES) {
      const faq = faqForDocument(t);
      seenQ1.add(faq[0].q);
      seenA1.add(faq[0].a);
      seenA2.add(faq[1].a);
    }
    expect(seenQ1.size).toBe(LEGAL_TEMPLATES.length);
    expect(seenA1.size).toBe(LEGAL_TEMPLATES.length);
    expect(seenA2.size).toBe(LEGAL_TEMPLATES.length);
  });

  it("faqJsonLd отдаёт валидную FAQPage-структуру", () => {
    const faq = faqForDocument(LEGAL_TEMPLATES[0]);
    const ld = faqJsonLd(faq) as {
      "@type": string;
      mainEntity: { "@type": string; name: string; acceptedAnswer: { "@type": string; text: string } }[];
    };
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(4);
    expect(ld.mainEntity[0]["@type"]).toBe("Question");
    expect(ld.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
  });
});