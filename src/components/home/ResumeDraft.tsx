"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, ArrowRight } from "lucide-react";
import { getAllDrafts, type DraftData } from "@/lib/autosave";
import { TEMPLATE_META_LITE } from "@/data/templatesMetaLite";

/** Баннер «Продолжить черновик» — если есть незаконченный документ. */
export default function ResumeDraft() {
  const [draft, setDraft] = useState<DraftData | null>(null);

  useEffect(() => {
    const drafts = getAllDrafts().sort(
      (a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt)
    );
    setDraft(drafts[0] ?? null);
  }, []);

  if (!draft) return null;

  const meta = TEMPLATE_META_LITE.find((t) => t.id === draft.templateId);
  const name = meta?.name ?? "документ";
  const filled = Object.values(draft.values ?? {}).filter((v) => v && v.trim()).length;

  return (
    <Link
      href={`/builder?template=${draft.templateId}`}
      className="group mb-6 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50/70 px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50"
    >
      <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white">
        <History className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-brand-600">
          Продолжить черновик
        </span>
        <span className="block truncate text-sm font-semibold text-gray-900">
          {name}
          {filled > 0 && <span className="font-normal text-gray-500"> · заполнено {filled} пол.</span>}
        </span>
      </span>
      <span className="inline-flex flex-none items-center gap-1 text-xs font-semibold text-brand-700">
        Открыть
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
