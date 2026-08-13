const STORAGE_PREFIX = "dogovor_draft_";
const VERSIONS_PREFIX = "dogovor_versions_";
const VERSION_LIMIT = 10;

export interface DraftData {
  templateId: string;
  values: Record<string, string>;
  checklist: Record<string, boolean>;
  activeTab: string;
  selectedVersion?: string;
  savedAt: string;
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
  selectedVersion?: string
): void {
  const data: DraftData = {
    templateId,
    values,
    checklist,
    activeTab,
    selectedVersion,
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_PREFIX + templateId, JSON.stringify(data));
  } catch {
    // localStorage may be full
  }
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
    const parsed = JSON.parse(raw);
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
