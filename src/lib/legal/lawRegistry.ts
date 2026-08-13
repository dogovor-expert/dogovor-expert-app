import registry from "./lawRegistry.json";

export interface CanonicalAct {
  code: string;
  max: number;
}

export interface LawIssue {
  severity: "error" | "warning";
  message: string;
}

interface Rule {
  id: string;
  match: { category?: string; nameHas?: string[]; nameNotHas?: string[] };
  mustInclude: string;
  note: string;
}

export function normalizeActSource(value: string): string {
  return value.replace(/\s+/g, " ").replace(/[–—]/g, "-").trim();
}

export function resolveAct(sourcePart: string): CanonicalAct | null {
  const seg = sourcePart.toLowerCase();
  for (const k of registry.keywords) {
    if (k.words.some((w) => seg.includes(w.toLowerCase()))) {
      return registry.acts.find((a) => a.code === k.code) ?? null;
    }
  }
  const num = seg.match(/(?:фз[- №№]*|закон.*?№\s*)(\d{2,4})/);
  if (num) {
    const code = (registry.numeric as Record<string, string>)[num[1]];
    if (code) return registry.acts.find((a) => a.code === code) ?? null;
  }
  const direct = registry.acts.find((a) => seg.includes(a.code.toLowerCase()));
  return direct ?? null;
}

function isVeed(sourcePart: string): boolean {
  const seg = sourcePart.toLowerCase();
  return registry.veed.some((v) => seg.includes(v.toLowerCase()));
}

export function auditActSource(actSource: string, category: string, name: string): LawIssue[] {
  const issues: LawIssue[] = [];
  const value = normalizeActSource(actSource);
  const segments = value.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
  let foundAct = false;

  for (const seg of segments) {
    const act = resolveAct(seg);
    if (act) {
      foundAct = true;
      for (const r of seg.matchAll(/ст(?:ать)?\.?\s*([0-9]+(?:\.[0-9]+)?)\s*([–—-]\s*[0-9]+(?:\.[0-9]+)?)?/g)) {
        const a = parseFloat(r[1]);
        if (Number.isFinite(a) && a > act.max) {
          issues.push({ severity: "error", message: `${act.code}: ст. ${a} больше максимума (${act.max}) в «${seg}»` });
        }
        if (r[2]) {
          const b = parseFloat(r[2].replace(/[–—-]/g, "").trim());
          if (Number.isFinite(b) && b <= a) {
            issues.push({ severity: "error", message: `некорректный диапазон ${a}-${b} в «${seg}»` });
          }
        }
      }
    }
  }

  const rules = (registry.rules as unknown as Rule[]) ?? [];
  for (const rule of rules) {
    const catOk = !rule.match.category || rule.match.category === category;
    const nameL = name.toLowerCase();
    const nameOk = !rule.match.nameHas || rule.match.nameHas.some((k) => nameL.includes(k.toLowerCase()));
    const nameExcluded = rule.match.nameNotHas?.some((k) => nameL.includes(k.toLowerCase())) ?? false;
    if (catOk && nameOk && !nameExcluded && !value.includes(rule.mustInclude)) {
      issues.push({ severity: "error", message: `${rule.id}: «${name}» — требуется ${rule.mustInclude} (${rule.note})` });
    }
  }

  if (!foundAct && !segments.some(isVeed)) {
    issues.push({ severity: "warning", message: `не найден известный НПА в «${actSource}»` });
  }
  return issues;
}

export default registry;
