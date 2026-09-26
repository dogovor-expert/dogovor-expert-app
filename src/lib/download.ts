/**
 * Надёжная загрузка file-saver при динамическом импорте.
 *
 * Проблема: file-saver — UMD-пакет без ESM-точки входа («module»/«exports»
 * в package.json нет). Статический `import { saveAs } from "file-saver"`
 * работает (бандлер проставляет interop на этапе сборки), а динамический
 * `const { saveAs } = await import("file-saver")` под webpack отдаёт
 * namespace только с `default` — деструктурированный saveAs равен undefined,
 * и вызов падает с TypeError уже в браузере (tsc/eslint этого не видят,
 * т.к. @types/file-saver декларирует именованный экспорт).
 *
 * loadSaveAs() принимает все три формы модуля и бросает понятную ошибку,
 * если saveAs недоступен ни в одной.
 */

export type SaveAsFn = (blob: Blob, filename?: string) => void;

interface FileSaverShape {
  saveAs?: SaveAsFn;
  default?: SaveAsFn | { saveAs?: SaveAsFn };
}

/** Чистая функция-резолвер (покрыта юнит-тестом без моков бандлера). */
export function resolveSaveAs(mod: FileSaverShape): SaveAsFn | undefined {
  if (typeof mod.saveAs === "function") return mod.saveAs;
  const d = mod.default;
  if (typeof d === "function") return d;
  if (d && typeof d.saveAs === "function") return d.saveAs;
  return undefined;
}

export async function loadSaveAs(): Promise<SaveAsFn> {
  const mod = (await import("file-saver")) as unknown as FileSaverShape;
  const fn = resolveSaveAs(mod);
  if (!fn) throw new Error("file-saver: saveAs недоступен");
  return fn;
}
