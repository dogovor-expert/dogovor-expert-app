import type { LegalTemplate, TemplateField } from "@/data/types";
import { getRoleMetaFor } from "@/lib/roleLabels";

export type OcrKind =
  | "passport"
  | "passportReg"
  | "pts"
  | "sts"
  | "epts"
  | "vuc"
  | null;

export interface DocSlot {
  id: string;
  label: string;
  hint: string;
  maxPhotos: number;
  ocrKind: OcrKind;
  rolePrefix?: string;
  optional?: boolean;
}

export interface PersonRole {
  prefix: string;
  label: string;
}

// Канонические метки/флаги ролей теперь в @/lib/roleRegistry (единый источник
// правды). Здесь оставлена только локальная эвристика вывода префиксов ролей из
// полей шаблона (discoverRolePrefixes) и fallback-вывод метки (deriveRoleLabel).

const hasPassportFields = (fields: TemplateField[], prefix: string) =>
  fields.some(
    (f) =>
      f.id === `${prefix}_passport` ||
      f.id.startsWith(`${prefix}_passport_`) ||
      (f.id === `${prefix}_fio` &&
        fields.some(
          (g) =>
            g.id.startsWith(`${prefix}_passport`) ||
            g.id === `${prefix}_birthday`
        ))
  );

const hasAddressField = (fields: TemplateField[], prefix: string) =>
  fields.some(
    (f) =>
      f.id === `${prefix}_address` ||
      f.id === `${prefix}_addr` ||
      f.id === `${prefix}_registration` ||
      f.id === `${prefix}_living_address`
  );

const hasVehicleFields = (fields: TemplateField[]) =>
  fields.some(
    (f) =>
      f.id === "car_vin" ||
      f.id === "car_pts" ||
      f.id === "car_sts" ||
      f.id === "car_plate" ||
      f.id.startsWith("car_") ||
      f.id === "vehicle_vin" ||
      f.id.startsWith("vehicle_") ||
      f.id.startsWith("trailer_") ||
      f.id === "boat_vin" ||
      f.id.startsWith("boat_")
  );

const hasRealtyFields = (fields: TemplateField[]) =>
  fields.some(
    (f) =>
      f.category === "realty" ||
      f.id.startsWith("flat_") ||
      f.id.startsWith("appartment_") ||
      f.id.startsWith("apartment_") ||
      f.id.startsWith("house_") ||
      f.id.startsWith("land_") ||
      f.id.startsWith("garage_") ||
      f.id.startsWith("dacha_") ||
      f.id === "cadastre_number" ||
      f.id === "cadastral_number" ||
      f.id === "realty_address"
  );

function deriveRoleLabel(fields: TemplateField[], prefix: string): string {
  const f = fields.find(
    (g) => g.id === `${prefix}_fio` || g.id === `${prefix}_name`
  );
  if (!f) return prefix;
  let lbl = f.label.split(":")[0].trim();
  lbl = lbl
    .replace(/ФИО/gi, "")
    .replace(/наименование/gi, "")
    .replace(/\(\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return lbl || prefix;
}

function discoverRolePrefixes(fields: TemplateField[]): string[] {
  const out = new Set<string>();
  for (const f of fields) {
    const m = f.id.match(/^([a-zA-Zа-яА-Я0-9]+)_(?:fio|name)$/);
    if (!m) continue;
    const p = m[1].toLowerCase();
    if (p === "contract" || p === "base") continue;
    const hasPass = fields.some(
      (g) => g.id === `${p}_passport` || g.id.startsWith(`${p}_passport`)
    );
    if (hasPass) out.add(p);
  }
  return [...out];
}

export function getTemplateRoles(template: LegalTemplate): PersonRole[] {
  const prefixes = discoverRolePrefixes(template.fields);
  return prefixes.map((p) => {
    const meta = getRoleMetaFor(template.id, p);
    if (meta) return { prefix: p, label: meta.label };
    return { prefix: p, label: deriveRoleLabel(template.fields, p) };
  });
}

export function getDocRequirements(template: LegalTemplate): DocSlot[] {
  const slots: DocSlot[] = [];
  const fields = template.fields;
  const roles = getTemplateRoles(template);

  for (const role of roles) {
    if (!hasPassportFields(fields, role.prefix)) continue;
    slots.push({
      id: `passport_${role.prefix}_main`,
      label: `Паспорт ${role.label} — стр. 2–3 (разворот)`,
      hint: "Фото разворота с фото: ФИО, дата рождения, серия, номер, кем выдан",
      maxPhotos: 1,
      ocrKind: "passport",
      rolePrefix: role.prefix,
    });
    if (hasAddressField(fields, role.prefix)) {
      slots.push({
        id: `passport_${role.prefix}_reg`,
        label: `Паспорт ${role.label} — стр. 4–5 (прописка)`,
        hint: "Фото разворота с отметкой о регистрации по месту жительства",
        maxPhotos: 1,
        ocrKind: "passportReg",
        rolePrefix: role.prefix,
      });
    }
  }

  // Юрлица: паспорта нет, но нужны учредительные документы / выписка ЕГРЮЛ.
  const hasCompanyFields = (prefix: string) =>
    fields.some(
      (f) =>
        f.id === `${prefix}_company` ||
        f.id === `${prefix}_inn` ||
        f.id === `${prefix}_ogrn` ||
        f.id === `${prefix}_name`
    );
  for (const role of roles) {
    if (hasPassportFields(fields, role.prefix)) continue;
    if (!hasCompanyFields(role.prefix)) continue;
    slots.push({
      id: `company_${role.prefix}`,
      label: `Учредительные документы / выписка ЕГРЮЛ ${role.label}`,
      hint: "Свидетельство о регистрации, ОГРН, ИНН, устав или свежая выписка ЕГРЮЛ",
      maxPhotos: 2,
      ocrKind: null,
      rolePrefix: role.prefix,
      optional: true,
    });
  }

  const hasPts = fields.some(
    (f) => f.id === "car_pts" || f.id.startsWith("pts_") || f.id === "pts_type"
  );
  const hasSts = fields.some(
    (f) => f.id === "car_sts" || f.id.startsWith("sts_")
  );
  const hasEpts = fields.some(
    (f) => f.id === "car_epts" || f.id === "epts_number"
  );

  if (hasVehicleFields(fields)) {
    if (hasPts) {
      slots.push({
        id: "pts_front",
        label: "ПТС — лицевая сторона",
        hint: "VIN, марка, модель, год, № двигателя, кузова, цвет, серия/№ ПТС",
        maxPhotos: 1,
        ocrKind: "pts",
      });
      slots.push({
        id: "pts_back",
        label: "ПТС — оборотная сторона",
        hint: "Сведения о собственниках — сверка с продавцом",
        maxPhotos: 1,
        ocrKind: "pts",
      });
    }
    if (hasEpts) {
      slots.push({
        id: "epts",
        label: "ЭПТС — выписка",
        hint: "Скрин или PDF выписки с номером ЭПТС (15 цифр)",
        maxPhotos: 1,
        ocrKind: "epts",
      });
    }
    if (hasSts) {
      slots.push({
        id: "sts_front",
        label: "СТС — лицевая сторона",
        hint: "Гос. номер, VIN, владелец, серия/№ СТС",
        maxPhotos: 1,
        ocrKind: "sts",
      });
    }
  }

  // Плитка водительского удостоверения — только для ролей, которые РЕАЛЬНО
  // управляют ТС (isDriver в roleRegistry). «agent»/«Представитель» водителем
  // не считается, поэтому для «Доверенности на управление ТС» плитка не
  // появляется (см. баг-репорт).
  const vucRole = roles.find((r) => getRoleMetaFor(template.id, r.prefix)?.isDriver);
  if (vucRole && hasVehicleFields(fields)) {
    slots.push({
      id: `vuc_${vucRole.prefix}`,
      label: `Водительское удостоверение ${vucRole.label}`,
      hint: "Лицевая и оборотная сторона (категории)",
      maxPhotos: 2,
      ocrKind: "vuc",
      rolePrefix: vucRole.prefix,
    });
  }

  if (hasRealtyFields(fields)) {
    slots.push({
      id: "egrn",
      label: "Выписка ЕГРН / правоустанавливающие",
      hint: "Все листы выписки или свидетельства о праве собственности",
      maxPhotos: 3,
      ocrKind: null,
      optional: true,
    });
  }

  const hasOsago = fields.some((f) => f.id.startsWith("osago_"));
  if (hasOsago) {
    slots.push({
      id: "osago",
      label: "Полис ОСАГО",
      hint: "Серия/номер полиса, кем выдан",
      maxPhotos: 1,
      ocrKind: null,
      optional: true,
    });
  }

  const hasFamilyDocs = fields.some(
    (f) => f.category === "family" || f.category === "spouse" || f.category === "spouse1" || f.category === "spouse2" || f.category === "child" || f.id.startsWith("spouse_") || f.id.startsWith("child_")
  );
  if (hasFamilyDocs) {
    slots.push({
      id: "marriage_cert",
      label: "Свидетельство о браке / рождении",
      hint: "Обе стороны бланка (при наличии)",
      maxPhotos: 2,
      ocrKind: null,
      optional: true,
    });
  }

  return slots;
}