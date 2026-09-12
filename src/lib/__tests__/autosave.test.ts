import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveDraft,
  loadDraft,
  clearDraft,
  getAllDrafts,
  pushDraftVersion,
  getDraftVersions,
  restoreDraftVersion,
  clearDraftVersions,
  DRAFT_SAVE_ERROR_EVENT,
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

describe("saveDraft: переполнение квоты (аудит D-3)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("полная запись не влезает → текст сохраняется без фото", () => {
    const real = Storage.prototype.setItem;
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation((k, v) => {
      if (String(v).includes("data:image")) throw new DOMException("QuotaExceededError");
      real.call(localStorage, k, v);
    });
    const ok = saveDraft("x", { a: "1" }, {}, "t", undefined, {
      s1: ["data:image/jpeg;base64,AAAA"],
    });
    spy.mockRestore();
    expect(ok).toBe(true);
    const d = loadDraft("x");
    expect(d?.values.a).toBe("1");
    expect(d?.photos).toBeFalsy();
  });

  it("квота не даёт сохранить ничего → false + событие warning", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("QuotaExceededError");
      });
    let detail: unknown = null;
    const handler = (e: Event) => {
      detail = (e as CustomEvent).detail;
    };
    window.addEventListener(DRAFT_SAVE_ERROR_EVENT, handler);
    const ok = saveDraft("y", { a: "1" }, {}, "t");
    window.removeEventListener(DRAFT_SAVE_ERROR_EVENT, handler);
    spy.mockRestore();
    expect(ok).toBe(false);
    expect(detail).toBe("quota");
  });

  it("при эвикции текущий черновик защищён, старые удаляются первыми", () => {
    // old — старый черновик, current — тот, что сохраняем.
    saveDraft("old", { v: "1" }, {}, "t");
    // сдвигаем savedAt вручную
    const old = loadDraft("old")!;
    localStorage.setItem(
      "dogovor_draft_old",
      JSON.stringify({ ...old, savedAt: new Date(Date.now() - 90 * 86400000).toISOString() })
    );
    const real = Storage.prototype.setItem;
    let attempts = 0;
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (k, v) {
      if (k.startsWith("dogovor_draft_") && attempts++ === 0) {
        throw new DOMException("QuotaExceededError");
      }
      real.call(localStorage, k, v);
    });
    const ok = saveDraft("current", { v: "2" }, {}, "t");
    spy.mockRestore();
    expect(ok).toBe(true);
    expect(localStorage.getItem("dogovor_draft_old")).toBeNull(); // вытеснен
    expect(loadDraft("current")?.values.v).toBe("2");
  });
});
