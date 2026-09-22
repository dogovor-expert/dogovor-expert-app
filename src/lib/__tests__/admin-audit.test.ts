import { describe, it, expect } from "vitest";
import { describeAuditRow, resourceName, actionName } from "@/lib/admin-audit";

const row = (over: Record<string, unknown>) => ({
  action: "feedback_status",
  resource: "feedback",
  resource_id: null as string | null,
  meta: null as unknown,
  ...over,
});

describe("describeAuditRow", () => {
  it("массовая смена статуса: «Сменил статус на X — обновлено N из M»", () => {
    const v = describeAuditRow(
      row({ meta: { status: "done", count: 5, changed: 4, bulk: true } }),
    );
    expect(v.verb).toBe("Сменил статус на «Выполнена» — обновлено 4 из 5");
    expect(v.object).toBe("Заявки");
    expect(v.tone).toBe("blue");
  });

  it("одиночная смена статуса", () => {
    const v = describeAuditRow(row({ resource_id: "a-b-c", meta: { status: "spam" } }));
    expect(v.verb).toBe("Сменил статус на «Спам»");
    expect(v.object).toBe("Заявка");
  });

  it("неизвестный будущий статус не прячем", () => {
    const v = describeAuditRow(row({ meta: { status: "mystery" } }));
    expect(v.verb).toContain("«mystery»");
  });

  it("удаление заявок со скриншотами", () => {
    const one = describeAuditRow(row({ action: "feedback_delete", meta: { count: 1 } }));
    expect(one.verb).toContain("Удалил заявку");
    const many = describeAuditRow(row({ action: "feedback_delete", meta: { count: 12 } }));
    expect(many.verb).toContain("Удалил 12 заявок");
  });

  it("смена роли со стрелкой", () => {
    const v = describeAuditRow(
      row({ action: "admin_role", resource: "profiles", resource_id: "u1", meta: { from: "moderator", to: "admin" } }),
    );
    expect(v.verb).toBe("Сменил роль: модератора → админа");
    expect(v.tone).toBe("purple");
  });

  it("подарок подписки: месяцы + причина + дата", () => {
    const v = describeAuditRow(
      row({
        action: "subscription_gift_extension",
        resource: "subscriptions",
        resource_id: "u2",
        meta: { months: 3, reason: "по акции", new_period_end: "2026-12-31T00:00:00.000Z" },
      }),
    );
    expect(v.verb).toBe("Продлил PRO на 3 месяца");
    expect(v.detail).toContain("Причина: по акции");
    expect(v.detail).toContain("31.12.26");
  });

  it("ручное изменение подписки словами", () => {
    const v = describeAuditRow(
      row({
        action: "profile_update",
        resource: "subscriptions",
        resource_id: "u3",
        meta: { plan: "pro", status: "past_due", auto_renewal: false },
      }),
    );
    expect(v.verb).toContain("Изменил подписку");
    expect(v.verb).toContain("тариф «pro»");
    expect(v.verb).toContain("просрочена");
    expect(v.verb).toContain("автопродление выкл.");
  });

  it("редактирование профиля: названия полей вместо ключей", () => {
    const v = describeAuditRow(
      row({ action: "profile_update", resource: "profiles", resource_id: "u4", meta: { full_name: "И.", phone: "+7" } }),
    );
    expect(v.verb).toContain("ФИО");
    expect(v.verb).toContain("телефон");
    expect(v.verb).not.toContain("full_name");
  });

  it("удаление реплеев: по возрасту и по одной", () => {
    const old = describeAuditRow(
      row({ action: "replay_delete", resource: "session_replays", meta: { deleted: 12, olderThanDays: 30 } }),
    );
    expect(old.verb).toContain("старше 30 дней");
    expect(old.verb).toContain("12 шт.");
    const one = describeAuditRow(
      row({ action: "replay_delete", resource: "session_replays", resource_id: "s1", meta: { deleted: 1 } }),
    );
    expect(one.verb).toContain("Удалил 1 запись экрана");
  });

  it("экспорт: строки и имя файла", () => {
    const v = describeAuditRow(
      row({ action: "export", resource: "feedback", meta: { filename: "feedback.csv", row_count: 128 } }),
    );
    expect(v.verb).toContain("Экспортировал в CSV (128 строк)");
    expect(v.object).toBe("Файл feedback.csv");
  });

  it("неизвестное будущее действие не прячем", () => {
    const v = describeAuditRow(
      row({ action: "mfa_reset", resource: "profiles", meta: { note: "ok" } }),
    );
    expect(v.verb).toContain("mfa_reset");
    expect(v.tone).toBe("gray");
  });

  it("кривой meta не роняет форматтер", () => {
    const v = describeAuditRow(row({ meta: "oops" }));
    expect(v.verb).toBeTruthy();
    const v2 = describeAuditRow({ action: "export", resource: "feedback", resource_id: null, meta: [1, 2] });
    expect(v2.verb).toContain("Экспортировал в CSV");
  });

  it("склонение месяцев", () => {
    const m1 = describeAuditRow(
      row({ action: "subscription_gift_extension", resource: "subscriptions", meta: { months: 1 } }),
    );
    expect(m1.verb).toContain("1 месяц");
    const m6 = describeAuditRow(
      row({ action: "subscription_gift_extension", resource: "subscriptions", meta: { months: 6 } }),
    );
    expect(m6.verb).toContain("6 месяцев");
  });
});

describe("словари", () => {
  it("resourceName покрывает все известные ресурсы", () => {
    for (const r of ["feedback", "profiles", "subscriptions", "session_replays"]) {
      expect(resourceName(r).one.length).toBeGreaterThan(1);
    }
    expect(resourceName("whatever").one).toBe("whatever");
  });
  it("actionName покрывает все известные коды", () => {
    for (const a of [
      "feedback_status",
      "feedback_delete",
      "profile_update",
      "admin_role",
      "subscription_gift_extension",
      "replay_delete",
      "export",
    ]) {
      expect(actionName(a)).not.toBe(a);
    }
  });
});