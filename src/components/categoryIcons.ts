import {
  Car,
  House,
  Briefcase,
  Bank,
  Heart,
  Scales,
  Airplane,
  EnvelopeSimpleOpen,
  FileText,
  type Icon,
} from "@phosphor-icons/react";

/** Заливные иконки категорий (Phosphor Fill) — единый словарь вместо эмодзи. */
export const CATEGORY_ICONS: Record<string, Icon> = {
  auto: Car,
  realty: House,
  business: Briefcase,
  finance: Bank,
  family: Heart,
  legal: Scales,
  other: FileText,
  migration: Airplane,
  postal: EnvelopeSimpleOpen,
};

export function categoryIcon(category: string): Icon {
  return CATEGORY_ICONS[category] ?? FileText;
}
