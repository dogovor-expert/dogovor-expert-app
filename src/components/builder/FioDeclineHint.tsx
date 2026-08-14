import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { declineFullFio, type FioCases } from "@/lib/decline";

const SHOWN: [string, keyof FioCases][] = [
  ["Род.", "gen"],
  ["Дат.", "dat"],
  ["Вин.", "acc"],
  ["Твор.", "ins"],
  ["Предл.", "pre"],
];

export default function FioDeclineHint({
  fio,
  focused,
  onInsert,
}: {
  fio: string;
  focused: boolean;
  onInsert: (value: string) => void;
}) {
  const trimmed = fio.trim();
  const cases = useMemo(() => declineFullFio(trimmed), [trimmed]);
  const relevant = useMemo(
    () => SHOWN.filter(([, key]) => cases[key] !== trimmed),
    [cases, trimmed]
  );
  const [feedback, setFeedback] = useState<{
    key: string;
    kind: "insert" | "copy";
  } | null>(null);

  if (focused || relevant.length === 0) return null;

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-medium text-purple-700">
        Склонение:
      </span>
      {relevant.map(([label, key]) => (
        <div
          key={key}
          className="flex items-center rounded-md bg-purple-50 border border-purple-100 overflow-hidden"
        >
          <button
            type="button"
            onClick={() => {
              onInsert(cases[key]);
              setFeedback({ key, kind: "insert" });
              setTimeout(() => setFeedback(null), 1500);
            }}
            title={`Вставить в поле (${label})`}
            className="text-[11px] px-2 py-1 text-purple-700 hover:bg-purple-100 truncate max-w-[220px] transition-colors"
          >
            {feedback?.key === key && feedback.kind === "insert"
              ? "вставлено ✓"
              : `${label}: ${cases[key]}`}
          </button>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(cases[key]);
              setFeedback({ key, kind: "copy" });
              setTimeout(() => setFeedback(null), 1500);
            }}
            title={`Копировать (${label})`}
            className="px-1.5 py-1 border-l border-purple-100 text-purple-400 hover:text-purple-700 hover:bg-purple-100 transition-colors"
          >
            {feedback?.key === key && feedback.kind === "copy" ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}