/**
 * Человеческое описание строк журнала действий админки.
 * Без Next-зависимостей — тестируется юнит-тестами.
 *
 * Принцип: каждая строка читается как «что сделал и с чем»,
 * без технических кодов (action) и сырого JSON (meta).
 * Неизвестные будущие коды НЕ прячем — показываем код явно,
 * чтобы пробелы в словаре сразу были видны.
 */

export interface AuditRowLite {
  action: string;
  resource: string;
  resource_id: string | null;
  meta: unknown;
}

export type AuditTone = "blue" | "green" | "amber" | "red" | "purple" | "gray";

export interface AuditView {
  verb: string;
  object: string;
  detail: string;
  tone: AuditTone;
}

const META_MAX = 90;

const FEEDBACK_STATUS: Record<string, string> = {
  new: "«Новая»",
  done: "«Выполнена»",
  spam: "«Спам»",
};

const SUB_STATUS: Record<string, string> = {
  active: "активна",
  inactive: "неактивна",
  trialing: "пробная",
  canceled: "отменена",
  past_due: "просрочена",
};

const ROLE_RU: Record<string, string> = {
  superadmin: "суперадмина",
  admin: "админа",
  moderator: "модератора",
  none: "обычного пользователя",
};

const PROFILE_FIELD: Record<string, string> = {
  full_name: "ФИО",
  company: "компания",
  inn: "ИНН",
  phone: "телефон",
};

const RESOURCE_RU: Record<string, { one: string; many: string; href?: string }> = {
  feedback: { one: "Заявка", many: "Заявки", href: "/admin/feedback" },
  profiles: { one: "Профиль", many: "Пользователи", href: "/admin/users" },
  subscriptions: { one: "Подписка", many: "Подписки", href: "/admin/subscriptions" },
  session_replays: { one: "Запись экрана", many: "Записи сессий", href: "/admin/replays" },
};

const ADMIN_ACTION_NAMED: Record<string, string> = {
  feedback_status: "Смена статуса заявки",
  feedback_delete: "Удаление заявки",
  profile_update: "Редактирование профиля",
  admin_role: "Смена роли",
  subscription_gift_extension: "Продление подписки в подарок",
  replay_delete: "Удаление записей сессий",
  export: "Экспорт данных",
};

const ADMIN_ACTION_TONE: Record<string, AuditTone> = {
  feedback_status: "blue",
  feedback_delete: "red",
  profile_update: "green",
  admin_role: "purple",
  subscription_gift_extension: "amber",
  replay_delete: "red",
  export: "gray",
};

function metaOf(row: AuditRowLite): Record<string, unknown> {
  const m = row.meta;
  return m && typeof m === "object" && !Array.isArray(m)
    ? (m as Record<string, unknown>)
    : {};
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function fmtDate(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso.slice(0, 10);
  return new Date(t).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

function shortList(list: string[], max = 2): string {
  if (list.length <= max) return list.join(", ");
  return `${list.slice(0, max).join(", ")} и ещё ${list.length - max}`;
}

/** Названия отредактированных полей профиля по ключам meta.update. */
function profileFields(meta: Record<string, unknown>): string {
  const keys = Object.keys(meta).filter((k) => k in PROFILE_FIELD);
  return keys.length ? shortList(keys.map((k) => PROFILE_FIELD[k])) : "данные";
}

export function describeAuditRow(row: AuditRowLite): AuditView {
  const tone: AuditTone = ADMIN_ACTION_TONE[row.action] ?? "gray";
  const meta = metaOf(row);

  switch (row.action) {
    case "feedback_status": {
      const status = str(meta.status);
      const label = FEEDBACK_STATUS[status] ?? (status ? `«${status}»` : "новый статус");
      const idsRaw = str(row.resource_id);
      const ids = idsRaw.split(",").map((s) => s.trim()).filter(Boolean);
      const count = num(meta.count) ?? (ids.length || 1);
      const changed = num(meta.changed);
      if (count > 1) {
        const done =
          changed !== null && changed !== count
            ? ` — обновлено ${changed} из ${count}`
            : ` (${count} ${plural(count, "заявка", "заявки", "заявок")})`;
        return {
          verb: `Сменил статус на ${label}${done}`,
          object: "Заявки",
          detail: "",
          tone,
        };
      }
      return { verb: `Сменил статус на ${label}`, object: "Заявка", detail: "", tone };
    }

    case "feedback_delete": {
      const count = num(meta.count) ?? 1;
      return {
        verb:
          count > 1
            ? `Удалил ${count} ${plural(count, "заявку", "заявки", "заявок")} (со скриншотами)`
            : "Удалил заявку (со скриншотами)",
        object: count > 1 ? "Заявки" : "Заявка",
        detail: "",
        tone,
      };
    }

    case "admin_role": {
      const from = str(meta.from) || "none";
      const to = str(meta.to) || "none";
      return {
        verb: `Сменил роль: ${ROLE_RU[from] ?? from} → ${ROLE_RU[to] ?? to}`,
        object: "Пользователь",
        detail: "",
        tone,
      };
    }

    case "profile_update": {
      if (row.resource === "subscriptions") {
        const bits: string[] = [];
        const plan = str(meta.plan);
        const status = str(meta.status);
        const auto = meta.auto_renewal;
        const periodEnd = str(meta.period_end ?? meta.new_period_end);
        if (plan) bits.push(`тариф «${plan}»`);
        if (status) bits.push(`статус: ${SUB_STATUS[status] ?? status}`);
        if (auto === true) bits.push("автопродление вкл.");
        if (auto === false) bits.push("автопродление выкл.");
        if (periodEnd) bits.push(`до ${fmtDate(periodEnd)}`);
        return {
          verb: `Изменил подписку${bits.length ? `: ${bits.join("; ")}` : ""}`,
          object: "Подписка",
          detail: "",
          tone,
        };
      }
      return {
        verb: `Отредактировал профиль (${profileFields(meta)})`,
        object: "Пользователь",
        detail: "",
        tone,
      };
    }

    case "subscription_gift_extension": {
      const months = num(meta.months);
      const reason = str(meta.reason);
      const end = str(meta.new_period_end);
      const parts: string[] = [];
      parts.push(
        months ? `Продлил PRO на ${months} ${plural(months, "месяц", "месяца", "месяцев")}` : "Продлил PRO в подарок",
      );
      if (reason) parts.push(`Причина: ${reason}`);
      if (end) parts.push(`активна до ${fmtDate(end)}`);
      return { verb: parts[0], object: "Подписка", detail: parts.slice(1).join(" · "), tone };
    }

    case "replay_delete": {
      const deleted = num(meta.deleted);
      const older = num(meta.olderThanDays);
      return {
        verb:
          older !== null
            ? `Удалил записи экрана старше ${older} ${plural(older, "дня", "дней", "дней")}${deleted !== null ? ` (${deleted} шт.)` : ""}`
            : deleted !== null
              ? `Удалил ${deleted} ${plural(deleted, "запись", "записи", "записей")} экрана`
              : "Удалил записи экрана",
        object: "Записи сессий",
        detail: "",
        tone,
      };
    }

    case "export": {
      const rows = num(meta.row_count);
      const file = str(meta.filename);
      return {
        verb: `Экспортировал в CSV${rows !== null ? ` (${rows} ${plural(rows, "строка", "строки", "строк")})` : ""}`,
        object: file ? `Файл ${file}` : "Заявки",
        detail: "",
        tone,
      };
    }

    default: {
      // Неизвестный будущий код: показываем его явно, не прячем.
      const keys = Object.keys(meta);
      const detail = keys.length
        ? keys
            .slice(0, 3)
            .map((k) => {
              const v = meta[k];
              const s = typeof v === "string" || typeof v === "number" || typeof v === "boolean" ? String(v) : "…";
              return s.length > META_MAX
                ? `${k}: ${s.slice(0, META_MAX - 1)}…`
                : `${k}: ${s}`;
            })
            .join("; ")
        : "—";
      return { verb: `Действие «${row.action}»`, object: resourceName(row.resource).many, detail, tone };
    }
  }
}

/** Русское имя объекта журнала: подпись для таблицы и фильтров. */
export function resourceName(resource: string): { one: string; many: string; href?: string } {
  return RESOURCE_RU[resource] ?? { one: resource, many: resource };
}

/** Русское название кода действия: для бейджа и фильтра. */
export function actionName(action: string): string {
  return ADMIN_ACTION_NAMED[action] ?? action;
}