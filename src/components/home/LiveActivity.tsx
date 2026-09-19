"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { TEMPLATE_META_LITE } from "@/data/templatesMetaLite";

/**
 * Социальное доказательство в реальном времени: ротация «Только что создали…»
 * и счётчик документов за сегодня. Данные витринные (иллюстративные) —
 * обновляются на клиенте после гидратации, чтобы не было mismatch.
 */

const TEMPLATE_IDS = [
  "dkp-auto",
  "raspiska-money",
  "rental-flat",
  "contract-works",
  "loan-individuals",
  "power-attorney",
];

const CITIES = [
  "Москва",
  "Санкт-Петербург",
  "Казань",
  "Новосибирск",
  "Екатеринбург",
  "Краснодар",
  "Нижний Новгород",
  "Самара",
  "Ростов-на-Дону",
  "Уфа",
];

interface FeedItem {
  name: string;
  city: string;
  id: string;
  mins: number;
}

function buildFeed(): FeedItem[] {
  return TEMPLATE_IDS.map((id, i) => {
    const t = TEMPLATE_META_LITE.find((x) => x.id === id);
    return {
      id,
      name: t?.name ?? "Документ",
      city: CITIES[i % CITIES.length],
      mins: 1 + i * 3,
    };
  });
}

/** Правдоподобный базовый счётчик: зависит от дня, растёт в течение дня. */
function todayBase(): number {
  const d = new Date();
  const seed = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
  return 900 + (seed % 700);
}

export default function LiveActivity() {
  const feed = buildFeed();
  const [idx, setIdx] = useState(0);
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const target = todayBase() + Math.floor(Math.random() * 220);
    setCount(target);

    const rotate = setInterval(() => setIdx((i) => (i + 1) % feed.length), 4000);
    const tick = setInterval(() => setCount((c) => c + 1), 15000);
    return () => {
      clearInterval(rotate);
      clearInterval(tick);
    };
  }, [feed.length]);

  const item = feed[idx];

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 shadow-soft backdrop-blur-sm sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5 flex-none">
          <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-red-500" />
        </span>
        <Activity className="h-4 w-4 flex-none text-gray-400" aria-hidden />
        <div key={idx} className="ticker-item min-w-0">
          <span className="text-xs text-gray-500">Только что создали: </span>
          <Link
            href={`/builder?template=${item.id}`}
            className="text-xs font-semibold text-gray-900 hover:text-brand-700"
          >
            {item.name}
          </Link>
          <span className="text-xs text-gray-500">, {item.city}</span>
          <span className="ml-1.5 text-[11px] text-gray-400">{item.mins} мин назад</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 text-xs">
        <span className="font-semibold text-gray-900">
          Сегодня создано <b className="tabular-nums">{count.toLocaleString("ru-RU")}</b>
        </span>
        <Link href="/templates" className="inline-flex items-center gap-0.5 font-semibold text-brand-600 hover:text-brand-700">
          документов
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
