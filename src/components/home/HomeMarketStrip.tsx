"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  MapPin,
  RefreshCw,
  Sun,
  TrendingDown,
  TrendingUp,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Погода: Open-Meteo (без ключа). Города — с координатами, чтобы не   */
/* зависеть от геолокации (она запрещена Permissions-Policy сайта).    */
/* ------------------------------------------------------------------ */
interface City {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    relative_humidity_2m?: number;
  };
}

interface CbrValute {
  Nominal?: number;
  Name?: string;
  Value: number;
  Previous: number;
}

interface CbrResponse {
  Date?: string;
  Valute?: Record<string, CbrValute>;
}

const CITIES: City[] = [
  { id: "moscow", name: "Москва", lat: 55.7558, lon: 37.6173 },
  { id: "spb", name: "Санкт-Петербург", lat: 59.9386, lon: 30.3141 },
  { id: "novosibirsk", name: "Новосибирск", lat: 55.0084, lon: 82.9357 },
  { id: "ekb", name: "Екатеринбург", lat: 56.8389, lon: 60.6057 },
  { id: "kazan", name: "Казань", lat: 55.7963, lon: 49.1088 },
  { id: "krasnodar", name: "Краснодар", lat: 45.0355, lon: 38.9753 },
];

const WMO: Record<number, string> = {
  0: "Ясно",
  1: "Преимущественно ясно",
  2: "Переменная облачность",
  3: "Пасмурно",
  45: "Туман",
  48: "Изморозь",
  51: "Морось",
  53: "Морось",
  55: "Морось",
  56: "Ледяная морось",
  57: "Ледяная морось",
  61: "Небольшой дождь",
  63: "Дождь",
  65: "Сильный дождь",
  66: "Ледяной дождь",
  67: "Ледяной дождь",
  71: "Небольшой снег",
  73: "Снег",
  75: "Сильный снег",
  77: "Снежная крупа",
  80: "Ливень",
  81: "Ливень",
  82: "Сильный ливень",
  85: "Снегопад",
  86: "Сильный снегопад",
  95: "Гроза",
  96: "Гроза с градом",
  99: "Гроза с градом",
};

function weatherIcon(code: number): LucideIcon {
  if (code === 0) return Sun;
  if (code === 1 || code === 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 57) return CloudDrizzle;
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return CloudRain;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return Cloud;
}

interface WeatherData {
  temp: number;
  code: number;
  wind: number;
  humidity: number;
}

interface Rate {
  code: string;
  value: number;
  diff: number;
}

interface CurrencyData {
  date: string;
  rates: Rate[];
}

const RATE_CODES = ["USD", "EUR", "CNY", "GBP"];
const CITY_KEY = "dogovor_weather_city_v1";

function fmtRate(n: number): string {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

/**
 * Полоса «Погода и курсы» под hero главной.
 *
 * Загружается из браузера: Open-Meteo (погода) и cbr-xml-daily.ru (курсы ЦБ).
 * Сервер не участвует, поэтому виджет не блокирует рендер страницы — при
 * недоступности API показывает текстовую заглушку, а не пустоту.
 * Выбранный город запоминается в localStorage.
 */
export default function HomeMarketStrip() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currency, setCurrency] = useState<CurrencyData | null>(null);
  const [weatherErr, setWeatherErr] = useState(false);
  const [currencyErr, setCurrencyErr] = useState(false);
  const [cityId, setCityId] = useState<string>("moscow");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("RUB");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CITY_KEY);
      if (saved && CITIES.some((c) => c.id === saved)) setCityId(saved);
    } catch {
      /* localStorage может быть недоступен — просто берём город по умолчанию */
    }
  }, []);

  const allCodes = useMemo(
    () => ["RUB", ...(currency?.rates.map((r) => r.code) ?? [])],
    [currency],
  );

  const rateMap = useMemo(() => {
    const m: Record<string, number> = { RUB: 1 };
    currency?.rates.forEach((r) => {
      m[r.code] = r.value;
    });
    return m;
  }, [currency]);

  const converted = useMemo(() => {
    const a = parseFloat(amount.replace(/\s/g, "").replace(",", "."));
    const rf = rateMap[from];
    const rt = rateMap[to];
    if (!isFinite(a) || !rf || !rt) return null;
    return (a * rf) / rt;
  }, [amount, from, to, rateMap]);

  const load = useCallback(
    async (withSpin = false) => {
      if (withSpin) setRefreshing(true);
      const city = CITIES.find((c) => c.id === cityId) ?? CITIES[0];

      const weatherReq = (async () => {
        try {
          const r = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
              "&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=Europe/Moscow",
            { cache: "no-store" },
          );
          if (!r.ok) throw new Error("wx");
          const d = (await r.json()) as OpenMeteoResponse;
          const c = d.current;
          if (!c || typeof c.temperature_2m !== "number") throw new Error("wx");
          setWeather({
            temp: c.temperature_2m,
            code: c.weather_code ?? 0,
            wind: c.wind_speed_10m ?? 0,
            humidity: c.relative_humidity_2m ?? 0,
          });
          setWeatherErr(false);
        } catch {
          setWeatherErr(true);
        }
      })();

      const currencyReq = (async () => {
        try {
          const r = await fetch("https://www.cbr-xml-daily.ru/daily_json.js", { cache: "no-store" });
          if (!r.ok) throw new Error("fx");
          const d = (await r.json()) as CbrResponse;
          if (!d.Valute) throw new Error("fx");
          const rates: Rate[] = RATE_CODES.map((code) => {
            const v = d.Valute?.[code];
            if (!v) return null;
            const nominal = v.Nominal || 1;
            return {
              code,
              value: v.Value / nominal,
              diff: (v.Value - v.Previous) / nominal,
            };
          }).filter((r): r is Rate => r !== null);
          if (!rates.length) throw new Error("fx");
          const date = new Date(d.Date ?? Date.now()).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
          });
          setCurrency({ date, rates });
          setCurrencyErr(false);
        } catch {
          setCurrencyErr(true);
        }
      })();

      await Promise.allSettled([weatherReq, currencyReq]);
      setUpdatedAt(new Date());
      if (withSpin) setRefreshing(false);
    },
    [cityId],
  );

  useEffect(() => {
    void load();
    // Обновляем раз в 10 минут, пока вкладка активна.
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 600_000);
    return () => window.clearInterval(id);
  }, [load]);

  const onCity = (id: string) => {
    setCityId(id);
    setWeather(null);
    setWeatherErr(false);
    try {
      window.localStorage.setItem(CITY_KEY, id);
    } catch {
      /* не критично */
    }
  };

  const wxLabel = weather ? (WMO[weather.code] ?? "—") : null;
  const WeatherIcon = weather ? weatherIcon(weather.code) : Cloud;
  const updatedLabel = updatedAt
    ? updatedAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <section aria-label="Погода и курсы валют" className="border-b border-slate-100 bg-slate-50/70 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1.1fr)]">
          {/* ---------- Погода ---------- */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-900/5 sm:p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <select
                  aria-label="Город"
                  value={cityId}
                  onChange={(e) => onCity(e.target.value)}
                  className="-ml-1 max-w-[9rem] cursor-pointer truncate rounded-md bg-transparent py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 outline-none transition-colors hover:text-slate-900 focus:text-slate-900"
                >
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-brand-500" aria-hidden="true">
                <WeatherIcon className="h-7 w-7" />
              </span>
            </div>

            {weather && wxLabel ? (
              <>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                    {Math.round(weather.temp)}°
                  </span>
                  <span className="mb-1 text-xs font-medium text-slate-500">{wxLabel}</span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Wind className="h-3 w-3" aria-hidden="true" /> {Math.round(weather.wind)} км/ч
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Droplets className="h-3 w-3" aria-hidden="true" /> {Math.round(weather.humidity)}%
                  </span>
                </div>
              </>
            ) : weatherErr ? (
              <p className="mt-3 text-sm text-slate-500">Погода недоступна</p>
            ) : (
              <div className="mt-2 space-y-2" aria-hidden="true">
                <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
              </div>
            )}
          </div>

          {/* ---------- Курсы валют ---------- */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-900/5 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Курсы ЦБ РФ
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    currency ? "bg-emerald-500" : "bg-slate-300",
                    currency && "animate-pulse",
                  )}
                />
                {currency ? currency.date : "загрузка…"}
              </span>
            </div>
            {currency ? (
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4 sm:gap-x-2">
                {currency.rates.map((r) => (
                  <div key={r.code} className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-500">{r.code}</div>
                    <div className="text-sm font-bold text-slate-900 tabular-nums">{fmtRate(r.value)}</div>
                    <div
                      className={cn(
                        "inline-flex items-center gap-0.5 text-[10px] font-semibold tabular-nums",
                        r.diff >= 0 ? "text-emerald-600" : "text-rose-600",
                      )}
                    >
                      {r.diff >= 0 ? (
                        <TrendingUp className="h-2.5 w-2.5" aria-hidden="true" />
                      ) : (
                        <TrendingDown className="h-2.5 w-2.5" aria-hidden="true" />
                      )}
                      {Math.abs(r.diff).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : currencyErr ? (
              <p className="mt-3 text-sm text-slate-500">Курсы временно недоступны</p>
            ) : (
              <div className="mt-3 grid grid-cols-4 gap-2" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-8 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---------- Конвертер ---------- */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-900/5 sm:col-span-2 sm:p-5 lg:col-span-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Конвертер
            </span>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-label="Сумма"
                className="w-20 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-semibold text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-24"
              />
              <select
                aria-label="Из валюты"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500"
              >
                {allCodes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setFrom(to);
                  setTo(from);
                }}
                aria-label="Поменять валюты местами"
                className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-600"
              >
                <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <select
                aria-label="В валюту"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500"
              >
                {allCodes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <span className="ml-auto text-sm font-extrabold text-slate-900 tabular-nums">
                {converted === null ? "—" : fmtRate(converted)} {to}
              </span>
            </div>
          </div>
        </div>

        {/* Общая строка обновления + ручной refresh */}
        <div className="mt-3 flex items-center justify-between gap-3 px-1 text-[11px] text-slate-500">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                refreshing ? "bg-brand-500 animate-ping" : "bg-emerald-500",
              )}
            />
            <span className="truncate">Данные обновлены в {updatedLabel} · ЦБ РФ и Open-Meteo</span>
          </span>
          <button
            type="button"
            onClick={() => void load(true)}
            disabled={refreshing}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-600 disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} aria-hidden="true" />
            Обновить
          </button>
        </div>
      </div>
    </section>
  );
}