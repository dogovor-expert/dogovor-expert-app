// Яндекс.РСЯ (RTB) — конфигурация рекламных слотов.
// Код загрузчика и блоков подключается ТОЛЬКО после согласия на marketing
// (см. src/components/ads/AdSlot.tsx). Здесь — статические данные:
// идентификаторы слотов, карта блоков и загрузчик.

export type AdSlotId =
  | "HOME_INFEED"
  | "BLOG_INFEED"
  | "BLOG_SIDEBAR"
  | "ARTICLE_INLINE"
  | "ARTICLE_SIDEBAR"
  | "ARTICLE_FOOTER"
  | "TEMPLATES_INFEED"
  | "CALC_RESULT"
  | "LANDING_INFEED"
  | "CONVERTER_FOOTER"
  | "CONVERTER_RELATED"
  | "DOC_TEMPLATE_FOOTER"
  | "RESUME_INFEED";

// Минимальная высота блока (px) — резервируется заранее, чтобы не ломать CLS.
export const SLOT_MIN_HEIGHT: Record<AdSlotId, number> = {
  HOME_INFEED: 250,
  BLOG_INFEED: 280,
  BLOG_SIDEBAR: 250,
  ARTICLE_INLINE: 250,
  ARTICLE_SIDEBAR: 250,
  ARTICLE_FOOTER: 200,
  TEMPLATES_INFEED: 200,
  CALC_RESULT: 200,
  LANDING_INFEED: 250,
  CONVERTER_FOOTER: 250,
  CONVERTER_RELATED: 200,
  DOC_TEMPLATE_FOOTER: 250,
  RESUME_INFEED: 250,
};

// Идентификаторы RTB-блоков из кабинета Яндекса
// («Реклама на сайтах → RTB-блоки → Получить код»).
// Пока пусто → слот не рендерит рекламу (остаётся зарезервированное место).
// Заполняется через переменные окружения сборки (NEXT_PUBLIC_*).
const RTB_BLOCK_IDS: Record<AdSlotId, string | undefined> = {
  HOME_INFEED: process.env.NEXT_PUBLIC_RTB_HOME_INFEED,
  BLOG_INFEED: process.env.NEXT_PUBLIC_RTB_BLOG_INFEED,
  BLOG_SIDEBAR: process.env.NEXT_PUBLIC_RTB_BLOG_SIDEBAR,
  ARTICLE_INLINE: process.env.NEXT_PUBLIC_RTB_ARTICLE_INLINE,
  ARTICLE_SIDEBAR: process.env.NEXT_PUBLIC_RTB_ARTICLE_SIDEBAR,
  ARTICLE_FOOTER: process.env.NEXT_PUBLIC_RTB_ARTICLE_FOOTER,
  TEMPLATES_INFEED: process.env.NEXT_PUBLIC_RTB_TEMPLATES_INFEED,
  CALC_RESULT: process.env.NEXT_PUBLIC_RTB_CALC_RESULT,
  LANDING_INFEED: process.env.NEXT_PUBLIC_RTB_LANDING_INFEED,
  CONVERTER_FOOTER: process.env.NEXT_PUBLIC_RTB_CONVERTER_FOOTER,
  CONVERTER_RELATED: process.env.NEXT_PUBLIC_RTB_CONVERTER_RELATED,
  DOC_TEMPLATE_FOOTER: process.env.NEXT_PUBLIC_RTB_DOC_TEMPLATE_FOOTER,
  RESUME_INFEED: process.env.NEXT_PUBLIC_RTB_RESUME_INFEED,
};

/** ID RTB-блока для слота или undefined, если блок не настроен. */
export function rtbBlockId(slot: AdSlotId): string | undefined {
  const v = RTB_BLOCK_IDS[slot]?.trim();
  return v ? v : undefined;
}

export const RTB_LOADER_SRC = "https://yandex.ru/ads/system/context.js";

type YaWindow = Window & {
  yaContextCb?: Array<() => void>;
  Ya?: {
    Context?: {
      AdvManager?: {
        render: (opts: { renderTo: string; blockId: string }) => void;
      };
    };
  };
};

/**
 * Однократно подключает загрузчик РСЯ. Должен вызываться только после
 * согласия пользователя на marketing.
 */
export function ensureRtbLoader(): void {
  if (typeof window === "undefined") return;
  const w = window as YaWindow;
  w.yaContextCb = w.yaContextCb || [];
  if (document.querySelector(`script[src="${RTB_LOADER_SRC}"]`)) return;
  const s = document.createElement("script");
  s.src = RTB_LOADER_SRC;
  s.async = true;
  document.head.appendChild(s);
}

/** Регистрирует рендер RTB-блока в контейнере с указанным id. */
export function renderRtbBlock(containerId: string, blockId: string): void {
  if (typeof window === "undefined") return;
  const w = window as YaWindow;
  (w.yaContextCb = w.yaContextCb || []).push(() => {
    w.Ya?.Context?.AdvManager?.render({ renderTo: containerId, blockId });
  });
}