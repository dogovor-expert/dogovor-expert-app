import { describe, it, expect, beforeEach } from "vitest";
import {
  saveDraft,
  loadDraft,
  clearDraft,
  getAllDrafts,
  pushDraftVersion,
  getDraftVersions,
  restoreDraftVersion,
  clearDraftVersions,
} from "@/lib/autosave";

describe("autosave", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trip: save → load", () => {
    saveDraft("dkp-auto", { seller_fio: "Иванов" }, { ok: true }, "seller");
    const draft = loadDraft("dkp-auto");
    expect(draft).not.toBeNull();
    expect(draft?.values.seller_fio).toBe("Иванов");
    expect(draft?.checklist).toEqual({ ok: true });
    expect(draft?.activeTab).toBe("seller");
    expect(draft?.templateId).toBe("dkp-auto");
  });

  it("load для несуществующего черновика → null", () => {
    expect(loadDraft("nope")).toBeNull();
  });

  it("clear удаляет черновик", () => {
    saveDraft("a", {}, {}, "contract");
    clearDraft("a");
    expect(loadDraft("a")).toBeNull();
  });

  it("getAllDrafts возвращает все черновики", () => {
    saveDraft("a", { f: "1" }, {}, "contract");
    saveDraft("b", { f: "2" }, {}, "seller");
    const drafts = getAllDrafts();
    expect(drafts).toHaveLength(2);
  });

  it("битая запись не роняет список и пропускается", () => {
    saveDraft("good", { f: "1" }, {}, "contract");
    localStorage.setItem("dogovor_draft_broken", "{oops not json");
    const drafts = getAllDrafts();
    expect(drafts).toHaveLength(1);
    expect(drafts[0].templateId).toBe("good");
  });

  it("версии: срезаются до 10", () => {
    for (let i = 0; i < 12; i++) {
      pushDraftVersion("dkp-auto", { v: String(i) }, {}, "seller");
    }
    const versions = getDraftVersions("dkp-auto");
    expect(versions).toHaveLength(10);
    expect(versions[0].values.v).toBe("11");
  });

  it("restoreDraftVersion восстанавливает значения", () => {
    pushDraftVersion("dkp-auto", { seller_fio: "Старый" }, {}, "seller");
    const version = getDraftVersions("dkp-auto")[0];
    restoreDraftVersion("dkp-auto", version);
    expect(loadDraft("dkp-auto")?.values.seller_fio).toBe("Старый");
  });

  it("clearDraftVersions удаляет историю", () => {
    pushDraftVersion("dkp-auto", { v: "1" }, {}, "seller");
    clearDraftVersions("dkp-auto");
    expect(getDraftVersions("dkp-auto")).toEqual([]);
  });

  it("битый JSON версий → пустой список", () => {
    localStorage.setItem("dogovor_versions_dkp-auto", "not json");
    expect(getDraftVersions("dkp-auto")).toEqual([]);
  });
});
