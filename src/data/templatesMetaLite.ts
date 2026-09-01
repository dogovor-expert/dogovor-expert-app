// Лёгкая версия метаданных шаблонов для клиентских страниц, где не нужны все поля.
// Содержит только поля, используемые на главной странице и в каталоге.
import { TEMPLATE_META } from "./templatesMeta";

export const TEMPLATE_META_LITE = TEMPLATE_META.map(({ id, name, category, description, fieldCount }) => ({
  id,
  name,
  category,
  description,
  fieldCount,
}));