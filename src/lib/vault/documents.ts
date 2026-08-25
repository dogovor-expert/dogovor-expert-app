// Зашифрованное хранилище документов в локальном vault (IndexedDB + AES-256-GCM).
// Каждая запись хранится как: { id, templateId, title, updatedAt, category, enc: Envelope }
// enc — зашифрованный полный payload (values, checklist, photos, подписи, версии).
// Метаданные в открытом виде для быстрых списков/поиска без расшифровки.

import { idbGet, idbPut, idbDelete, idbGetAll, STORE } from "./idb";
import { encryptJSON, decryptJSON, type Envelope } from "./keyManager";
import type { DraftData, DraftVersion } from "@/lib/autosave";

export interface VaultDocMeta {
  id: string; // "vault:<templateId>"
  templateId: string;
  title: string;
  category: string;
  updatedAt: string;
}

export interface VaultDocPayload {
  values: Record<string, string>;
  checklist: Record<string, boolean>;
  activeTab: string;
  savedAt: string;
  photos?: Record<string, string[]>;
  esignSeller?: string | null;
  esignBuyer?: string | null;
  versions?: DraftVersion[];
}

const DOC_PREFIX = "vault:";

function vaultId(templateId: string): string {
  return DOC_PREFIX + templateId;
}

export async function saveVaultDoc(
  templateId: string,
  payload: VaultDocPayload
): Promise<void> {
  const tplMeta = await import("@/data/templatesMeta").then(
    (m) => m.TEMPLATE_META.find((t) => t.id === templateId)
  );
  const now = new Date().toISOString();
  const meta: VaultDocMeta = {
    id: vaultId(templateId),
    templateId,
    title: tplMeta?.name || templateId,
    category: tplMeta?.category || "other",
    updatedAt: now,
  };
  const enc = await encryptJSON({ ...payload, templateId, _meta: meta });
  await idbPut(STORE.docs, { ...meta, enc });
}

export async function getVaultDoc(
  templateId: string
): Promise<VaultDocPayload | null> {
  const rec = await idbGet<{ enc: Envelope } & VaultDocMeta>(STORE.docs, vaultId(templateId));
  if (!rec) return null;
  const payload = await decryptJSON<VaultDocPayload>(rec.enc);
  return payload;
}

export async function deleteVaultDoc(templateId: string): Promise<void> {
  await idbDelete(STORE.docs, vaultId(templateId));
}

export async function listVaultDocs(): Promise<VaultDocMeta[]> {
  const all = await idbGetAll<{ enc: Envelope } & VaultDocMeta>(STORE.docs);
  return all
    .map((r) => ({
      id: r.id,
      templateId: r.templateId,
      title: r.title,
      category: r.category,
      updatedAt: r.updatedAt,
    }))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/** Конвертер из старого DraftData (localStorage) в VaultDocPayload */
export function draftToVaultPayload(d: DraftData, esignSeller?: string | null, esignBuyer?: string | null): VaultDocPayload {
  return {
    values: d.values,
    checklist: d.checklist,
    activeTab: d.activeTab,
    savedAt: d.savedAt,
    photos: d.photos,
    esignSeller: esignSeller ?? null,
    esignBuyer: esignBuyer ?? null,
    versions: undefined, // версии отдельно в localStorage (dogovor_versions_*)
  };
}