const STORAGE_PREFIX = "dogovor_draft_";
const VERSIONS_PREFIX = "dogovor_versions_";
const VERSION_LIMIT = 10;

export type DraftSaveFailure = "quota" | "unavailable";

/** Имя события, которое диспатчится при отказе записи (для глобального тоста). */
export const DRAFT_SAVE_ERROR_EVENT = "dogovor:draft-save-error";

function dispatchSaveError(reason: DraftSaveFailure) {
  try {
    window.dispatchEvent(new CustomEvent(DRAFT_SAVE_ERROR_EVENT, { detail: reason }));
  } catch {
    /* SSR / окружение без CustomEvent */
  }
}

function write(key: string, payload: string): boolean {
  try {
    localStorage.setItem(key, payload);
    return true;
  } catch {
    return false;
  }
}

/**
 * LRU-эвикция при переполнении квоты (5–10 МБ): удаляем самые старые черновики
 * (по savedAt), кроме текущего. Молчаливая потеря данных хуже, чем удаление
 * давно не открывавшихся; предупреждаем событием.
 */
function evictOldestDrafts(protectId: string, count = 3): void {
  const ages: { key: string; savedAt: number }[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(STORAGE_PREFIX)) continue;
      const tpl = key.slice(STORAGE_PREFIX.length);
      if (tpl === protectId) continue;
      let savedAt = 0;
      try {
        const rec: unknown = JSON.parse(localStorage.getItem(key) || "{}");
        const rawSavedAt = rec && typeof rec === "object" ? (rec as { savedAt?: unknown }).savedAt : undefined;
        savedAt = typeof rawSavedAt === "string" ? Date.parse(rawSavedAt) || 0 : 0;
      } catch {
        /* битая запись — считаем самой старой и чистим первой */
      }
      ages.push({ key, savedAt });
    }
  } catch {
    return;
  }
  ages.sort((a, b) => a.savedAt - b.savedAt);
  for (const { key } of ages.slice(0, count)) localStorage.removeItem(key);
}

export interface DraftData {
  templateId: string;
  values: Record<string, string>;
  checklist: Record<string, boolean>;
  activeTab: string;
  selectedVersion?: string;
  savedAt: string;
  /** Сканы документов: слот -> dataURL (хранится только локально). */
  photos?: Record<string, string[]>;
}

export interface DraftVersion {
  templateId: string;
  values: Record<string, string>;
  checklist: Record<string, boolean>;
  activeTab: string;
  savedAt: string;
}

export function saveDraft(
  templateId: string,
  values: Record<string, string>,
  checklist: Record<string, boolean>,
  activeTab: string,
  selectedVersion?: string,
  photos?: Record<string, string[]>
): boolean {
  const data: DraftData = {
    templateId,
    values,
    checklist,
    activeTab,
    selectedVersion,
    savedAt: new Date().toISOString(),
    photos,
  };
  const key = STORAGE_PREFIX + templateId;
  // Стратегия при переполнении квоты: 1) полная запись; 2) без фото
  // (сканы — самые тяжёлые, текст обязательно сохраняем); 3) LRU-эвикция
  // старых черновиков + повтор; всё неудачно → событие, UI предупредит.
  if (write(key, JSON.stringify(data))) return true;
  if (photos && Object.keys(photos).length > 0) {
    const withoutPhotos: DraftData = { ...data, photos: undefined };
    if (write(key, JSON.stringify(withoutPhotos))) return true;
  }
  evictOldestDrafts(templateId, 3);
  if (write(key, JSON.stringify(data))) return true;
  const minimal: DraftData = { ...data, photos: undefined };
  if (write(key, JSON.stringify(minimal))) return true;
  dispatchSaveError("quota");
  return false;
}

export function loadDraft(templateId: string): DraftData | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + templateId);
    if (!raw) return null;
    return JSON.parse(raw) as DraftData;
  } catch {
    return null;
  }
}

export function clearDraft(templateId: string): void {
  localStorage.removeItem(STORAGE_PREFIX + templateId);
}

export function getAllDrafts(): DraftData[] {
  const drafts: DraftData[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      try {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) drafts.push(JSON.parse(raw) as DraftData);
        }
      } catch {
        // Битая запись одного черновика не должна ронять весь список.
      }
    }
  } catch {
    // localStorage недоступен (приватный режим / блокировка хранилища
    // браузером или расширением) — считаем черновиков нет.
  }
  return drafts;
}

export function pushDraftVersion(
  templateId: string,
  values: Record<string, string>,
  checklist: Record<string, boolean>,
  activeTab: string
): void {
  try {
    const versions = getDraftVersions(templateId);
    const nowISO = new Date().toISOString();
    versions.unshift({
      templateId,
      values,
      checklist,
      activeTab,
      savedAt: nowISO,
    });
    localStorage.setItem(
      VERSIONS_PREFIX + templateId,
      JSON.stringify(versions.slice(0, VERSION_LIMIT))
    );
  } catch {
    // localStorage may be full
  }
}

export function getDraftVersions(templateId: string): DraftVersion[] {
  try {
    const raw = localStorage.getItem(VERSIONS_PREFIX + templateId);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DraftVersion[]) : [];
  } catch {
    return [];
  }
}

export function restoreDraftVersion(templateId: string, version: DraftVersion): void {
  saveDraft(
    templateId,
    version.values,
    version.checklist,
    version.activeTab
  );
}

export function clearDraftVersions(templateId: string): void {
  localStorage.removeItem(VERSIONS_PREFIX + templateId);
}
