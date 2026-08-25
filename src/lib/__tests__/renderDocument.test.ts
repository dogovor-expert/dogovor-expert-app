import { describe, it, expect } from "vitest";
import {
  formatRuDate,
  renderTemplateDocument,
  buildPackValues,
} from "@/lib/renderDocument";
import { dkpLikeTemplate, invoiceTemplate, receiptTemplate } from "./fixtures";

describe("formatRuDate", () => {
  it("ГОСТ Р 7.0.97-2016: словесно-цифровой", () => {
    expect(formatRuDate("2026-05-27")).toBe("27\u00A0мая\u00A02026\u00A0г.");
  });

  it("убирает ведущий ноль у дня", () => {
    expect(formatRuDate("2026-05-07")).toBe("7\u00A0мая\u00A02026\u00A0г.");
  });

  it("не-дата возвращается как есть", () => {
    expect(formatRuDate("завтра")).toBe("завтра");
  });

  it("неверный месяц возвращается как есть", () => {
    expect(formatRuDate("2026-13-01")).toBe("2026-13-01");
  });
});

describe("renderTemplateDocument", () => {
  it("экранирует пользовательский ввод (XSS)", () => {
    const html = renderTemplateDocument(dkpLikeTemplate, {
      comment: "<script>alert(1)</script>",
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("lt;script");
  });

  it("не экранирует повторно: & выводится ровно один раз", () => {
    const html = renderTemplateDocument(dkpLikeTemplate, {
      comment: "Иванов & Петров",
    });
    expect(html).toContain("Иванов &amp; Петров");
    expect(html).not.toContain("&amp;amp;");
  });

  it("слэши и кавычки экранируются: нет сырых тегов, & экранируется", () => {
    const html = renderTemplateDocument(dkpLikeTemplate, {
      comment: `O"Brien <b>&</b>`,
    });
    // DOMPurify нормализует &quot; → " (безопасно в тексте), но сырой тег недопустим.
    expect(html).toContain('O"Brien');
    expect(html).not.toContain("<b>");
    expect(html).toContain("&lt;b&gt;");
    expect(html).toContain("&amp;");
    expect(html).not.toContain("&amp;quot;");
  });

  it("дата рендерится словесно-цифровым способом", () => {
    const html = renderTemplateDocument(dkpLikeTemplate, { date: "2026-05-27" });
    expect(html).toContain("27&nbsp;мая&nbsp;2026&nbsp;г.");
  });

  it("сумма прописью подставляется автоматически (_words)", () => {
    const html = renderTemplateDocument(dkpLikeTemplate, {
      contract_price: "950000",
    });
    expect(html).toContain("девятьсот пятьдесят тысяч рублей 00 копеек");
  });

  it("родительный падеж ФИО подставляется автоматически (_gen)", () => {
    const html = renderTemplateDocument(dkpLikeTemplate, {
      seller_fio: "Иванов Иван Иванович",
    });
    expect(html).toContain("Иванова Ивана Ивановича");
  });

  it("checkbox true рендерится как секция", () => {
    const html = renderTemplateDocument(dkpLikeTemplate, { agreed: "true" });
    expect(html).toContain("ДА");
  });

it("checkbox false не рендерит секцию", () => {
    const html = renderTemplateDocument(dkpLikeTemplate, { agreed: "false" });
    expect(html).not.toContain("ДА");
  });

  it("radio: label выбранной опции доступен как field_label", () => {
    const tpl = {
      ...dkpLikeTemplate,
      fields: [
        ...dkpLikeTemplate.fields,
        {
          id: "seller_status",
          label: "Статус",
          type: "radio" as const,
          defaultValue: "person",
          category: "seller" as const,
          options: [
            { label: "Физическое лицо", value: "person" },
            { label: "Юридическое лицо", value: "legal" },
          ],
        },
      ],
      previewTemplate:
        dkpLikeTemplate.previewTemplate +
        '<div class="s-label">{{{seller_status_label}}}</div>',
    };
    const html = renderTemplateDocument(tpl, { seller_status: "legal" });
    expect(html).toContain("Юридическое лицо");
  });

  it("radio: boolean-флаг field_is_value позволяет условные секции", () => {
    const tpl = {
      ...dkpLikeTemplate,
      fields: [
        ...dkpLikeTemplate.fields,
        {
          id: "seller_status",
          label: "Статус",
          type: "radio" as const,
          defaultValue: "person",
          category: "seller" as const,
          options: [
            { label: "Физическое лицо", value: "person" },
            { label: "Юридическое лицо", value: "legal" },
          ],
        },
      ],
      previewTemplate:
        dkpLikeTemplate.previewTemplate +
        "{{#seller_status_is_legal}}<div class='legal-block'>юрлицо</div>{{/seller_status_is_legal}}" +
        "{{#seller_status_is_person}}<div class='person-block'>физлицо</div>{{/seller_status_is_person}}",
    };
    const legal = renderTemplateDocument(tpl, { seller_status: "legal" });
    expect(legal).toContain("legal-block");
    expect(legal).not.toContain("person-block");
    const person = renderTemplateDocument(tpl, { seller_status: "person" });
    expect(person).toContain("person-block");
    expect(person).not.toContain("legal-block");
  });

  it("repeating: элементы с нумерацией", () => {
    const html = renderTemplateDocument(dkpLikeTemplate, {
      items: JSON.stringify([
        { name: "Консультация", sum: "100000" },
        { name: "Подготовка", sum: "20000" },
      ]),
    });
    expect(html).toContain("<td>1</td>");
    expect(html).toContain("<td>2</td>");
    expect(html).toContain("Консультация");
    expect(html).toContain("100000");
  });

  it("invoice: итоги и НДС, QR-код вставляется", () => {
    const html = renderTemplateDocument(
      invoiceTemplate,
      {
        items: JSON.stringify([
          { name: "Услуга", sum: "100" },
          { name: "Услуга 2", sum: "50" },
        ]),
        nds_rate: "20",
        show_qr: "true",
      },
      { qrSvg: "<svg>QR</svg>" }
    );
    expect(html).toContain("150,00");
    expect(html).toContain("25,00");
    expect(html).toContain("<svg>QR</svg>");
  });

  it("invoice без НДС: НДС 0", () => {
    const html = renderTemplateDocument(
      invoiceTemplate,
      { items: "[]", nds_rate: "без НДС", show_qr: "false" },
      { qrSvg: "<svg>QR</svg>" }
    );
    expect(html).toContain("0,00");
    expect(html).not.toContain("QR</svg>");
  });

  it("подпись продавца вставляется перед блоком", () => {
    const html = renderTemplateDocument(
      dkpLikeTemplate,
      {},
      { signSeller: "data:image/png;base64,AAA" }
    );
    expect(html).toContain("data:image/png;base64,AAA");
    expect(html).toContain("alt=\"подпись\"");
  });

  it("без подписи блок не трогается", () => {
    const html = renderTemplateDocument(dkpLikeTemplate, {});
    expect(html).not.toContain("alt=\"подпись\"");
  });
});

describe("buildPackValues", () => {
  it("паспорт собирается из серии и номера основной формы", () => {
    const out = buildPackValues(receiptTemplate, {
      seller_passport_series: "4512",
      seller_passport_number: "348912",
      city: "Москва",
      contract_price: "950000",
    });
    expect(out.seller_passport).toBe("4512 348912");
    expect(out.city).toBe("Москва");
    expect(out.contract_price).toBe("950000");
  });

  it("прямые значения полей-спутников сохраняются", () => {
    const out = buildPackValues(receiptTemplate, {
      seller_fio: "Иванов Иван Иванович",
      buyer_fio: "Петров Пётр Петрович",
    });
    expect(out.seller_fio).toBe("Иванов Иван Иванович");
    expect(out.buyer_fio).toBe("Петров Пётр Петрович");
  });

  it("алиас: amount → contract_price", () => {
    const out = buildPackValues(receiptTemplate, { amount: "500000" });
    expect(out.contract_price).toBe("500000");
  });

  it("пустая форма → пустой результат", () => {
    expect(buildPackValues(receiptTemplate, {})).toEqual({});
  });
});
