import { useEffect, useMemo, useRef, useState } from "react";
import { computeFingerprint } from "../lib/hash";
import { formatDateTime, shortenHash } from "../lib/format";
import {
  Camera,
  CheckCircle2,
  Fingerprint,
  Globe,
  Link2,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface CaptureResult {
  hash: string;
  capturedAt: string;
  charCount: number;
}

// Interactive "capture a page" playground. The user pastes any block of text
// (or an example is filled in) and Chronoleaf computes a SHA-256 fingerprint
// on the fly, showcasing how a real snapshot is minted.
export const CaptureView = ({ onDone }: { onDone?: (hash: string) => void }) => {
  const [url, setUrl] = useState("https://atlas-market.example/help/refund-policy");
  const [content, setContent] = useState(defaultContent);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [progress, setProgress] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer));
    },
    [],
  );

  const cleanUrl = useMemo(() => url.replace(/^https?:\/\//, "").replace(/\/$/, ""), [url]);

  const capture = async () => {
    if (busy) return;
    setBusy(true);
    setResult(null);
    setProgress(0);
    const payload = `${url}\n\n${content}\n\n${new Date().toISOString()}`;

    const steps = [12, 34, 58, 78];
    steps.forEach((value, index) => {
      const timer = setTimeout(() => setProgress(value), (index + 1) * 220);
      timers.current.push(timer);
    });

    const hash = await computeFingerprint(payload);
    const timer = setTimeout(() => {
      setProgress(100);
      setBusy(false);
      const captured: CaptureResult = {
        hash,
        capturedAt: new Date().toISOString(),
        charCount: content.length,
      };
      setResult(captured);
      onDone?.(hash);
    }, 1100);
    timers.current.push(timer);
  };

  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="paper-card p-5 sm:p-6">
        <header className="border-b border-[color:var(--color-line-soft)] pb-4">
          <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
            Заверить страницу
          </div>
          <h2 className="mt-1 text-[20px] font-semibold tracking-tight text-[color:var(--color-ink)] sm:text-[22px]">
            Демо-захват: как рождается слепок
          </h2>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[color:var(--color-ink-soft)]">
            Вставьте адрес и текст интересующего пункта — Chronoleaf посчитает SHA-256 прямо в вашем браузере. В обычном режиме к отпечатку добавляются полный HTML и визуальный рендер страницы.
          </p>
        </header>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mono block text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
              Адрес страницы
            </label>
            <div className="mt-1 flex items-center gap-2 rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] px-3 py-2">
              <Globe size={15} strokeWidth={1.7} className="text-[color:var(--color-ink-mute)]" />
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="w-full bg-transparent text-[13px] text-[color:var(--color-ink)] outline-none placeholder:text-[color:var(--color-ink-mute)]"
              />
            </div>
          </div>

          <div>
            <label className="mono block text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
              Что заверяем
            </label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={10}
              className="chronoleaf-page mt-1 w-full rounded-[12px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] px-4 py-3 text-[13px] leading-relaxed text-[color:var(--color-ink)] shadow-inner outline-none focus:border-[color:var(--color-ink)]/40"
              placeholder="Вставьте текст оферты, тарифов или правил возврата"
            />
            <div className="mono mt-1 flex items-center justify-between text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
              <span>{content.length} символов</span>
              <span>Считается в вашем браузере</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={capture}
              disabled={busy || content.length < 20}
              className="inline-flex items-center gap-2 rounded-[10px] bg-[color:var(--color-ink)] px-4 py-2.5 text-[13px] font-medium text-[color:var(--color-paper)] transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <LoaderCircle size={15} strokeWidth={1.9} className="animate-spin" />
                  Заверяем…
                </>
              ) : (
                <>
                  <Camera size={15} strokeWidth={1.9} />
                  Сделать слепок
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setContent(defaultContent);
                setUrl("https://atlas-market.example/help/refund-policy");
                setResult(null);
              }}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] px-3 py-2 text-[12px] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink)]/30"
            >
              <Sparkles size={13} strokeWidth={1.9} />
              Заполнить примером
            </button>
          </div>

          <div className="rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-3">
            <div className="mono flex items-center justify-between text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
              <span>Прогресс заверения</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--color-line-soft)]">
              <div
                className="h-full rounded-full bg-[color:var(--color-ink)] transition-[width]"
                style={{ width: `${progress}%`, transitionDuration: "220ms" }}
              />
            </div>
            <ol className="mt-3 space-y-1.5 text-[11.5px] text-[color:var(--color-ink-soft)]">
              <ProgressStep active={progress >= 12} label="Читаем HTML и заголовки" />
              <ProgressStep active={progress >= 34} label="Снимаем визуальный рендер" />
              <ProgressStep active={progress >= 58} label="Нормализуем текст (удаляем скрипты и таймштампы)" />
              <ProgressStep active={progress >= 78} label="Считаем SHA-256 отпечаток" />
              <ProgressStep active={progress >= 100} label="Сохраняем в вашем архиве" />
            </ol>
          </div>
        </div>
      </div>

      <div className="paper-card overflow-hidden p-0">
        <div className="border-b border-[color:var(--color-line-soft)] bg-[color:var(--color-paper-sunk)]/60 px-5 py-4">
          <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
            Свидетельство заверения
          </div>
          <div className="mt-1 flex items-center gap-2 text-[14px] font-semibold text-[color:var(--color-ink)]">
            <ShieldCheck size={16} strokeWidth={1.8} className="text-[color:var(--color-safe)]" />
            {result ? "Слепок готов" : "Ожидание захвата"}
          </div>
        </div>

        <div className="space-y-3 px-5 py-5 text-[12.5px]">
          <MetaLine icon={Link2} label="Адрес">
            <span className="mono truncate text-[12px] text-[color:var(--color-ink)]">{cleanUrl}</span>
          </MetaLine>
          <MetaLine icon={Fingerprint} label="Отпечаток">
            {result ? (
              <span className="mono select-all text-[12px] text-[color:var(--color-ink)]">
                {shortenHash(result.hash, 12, 10)}
              </span>
            ) : (
              <span className="mono text-[12px] text-[color:var(--color-ink-mute)]">будет посчитан</span>
            )}
          </MetaLine>
          <MetaLine icon={Camera} label="Захвачено">
            {result ? (
              <span className="text-[12px] text-[color:var(--color-ink)]">{formatDateTime(result.capturedAt)}</span>
            ) : (
              <span className="text-[12px] text-[color:var(--color-ink-mute)]">—</span>
            )}
          </MetaLine>
          <MetaLine icon={ShieldCheck} label="Хранение">
            <span className="text-[12px] text-[color:var(--color-ink-soft)]">Локально · в вашем браузере</span>
          </MetaLine>

          {result && (
            <div className="mt-4 rounded-[10px] border border-[color:var(--color-diff-add-border)] bg-[color:var(--color-diff-add-bg)]/50 p-3 text-[12px] text-[color:var(--color-diff-add)]">
              <div className="mb-1 flex items-center gap-2 font-medium">
                <CheckCircle2 size={13} strokeWidth={1.9} />
                Готово. Chronoleaf добавил слепок в архив.
              </div>
              <p className="text-[color:var(--color-ink-soft)]">
                Теперь при любых изменениях документа мы сравним новую версию с этой и подсветим то, что важно юридически.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const ProgressStep = ({ active, label }: { active: boolean; label: string }) => (
  <li className="flex items-center gap-2">
    <span
      className={`grid h-4 w-4 place-items-center rounded-full border text-[9px] ${
        active
          ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
          : "border-[color:var(--color-line)] bg-[color:var(--color-paper)] text-transparent"
      }`}
    >
      ✓
    </span>
    <span className={active ? "text-[color:var(--color-ink)]" : "text-[color:var(--color-ink-mute)]"}>{label}</span>
  </li>
);

const MetaLine = ({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Camera;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-3 rounded-[8px] border border-[color:var(--color-line-soft)] bg-[color:var(--color-paper)] px-3 py-2">
    <Icon size={14} strokeWidth={1.7} className="text-[color:var(--color-ink-mute)]" />
    <div className="mono min-w-[80px] text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
      {label}
    </div>
    <div className="ml-auto min-w-0 flex-1 text-right">{children}</div>
  </div>
);

const defaultContent = `2.1. Возврат обеспечительного платежа осуществляется в течение 5 (пяти) календарных дней с даты завершения аренды.
2.2. Обеспечительный платёж возвращается на реквизиты, указанные Покупателем при оформлении, без дополнительных подтверждений.
3.1. Не подлежат возврату подарочные карты, активированные Покупателем.
4.1. Все споры разрешаются в судебном порядке по месту жительства Покупателя.`;
