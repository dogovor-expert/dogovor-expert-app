"use client";
import { useEffect, useState } from "react";
import { Shield, ExternalLink } from "lucide-react";

const WIDGET_SCRIPT = "https://widgets.inssmart.ru/widgets/b2c-frame.loader.js";
const CONSENT_KEY = "dogovor_inssmart_osago_consent_v1";

export default function InssmartWidget() {
  const [consented, setConsented] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(CONSENT_KEY) === "1") {
      setConsented(true);
    }
  }, []);

  useEffect(() => {
    if (!consented) return;
    if (document.getElementById("inssmart-widget-script")) return;
    const script = document.createElement("script");
    script.id = "inssmart-widget-script";
    script.type = "text/javascript";
    script.src = WIDGET_SCRIPT;
    script.dataset.id = "inssmart-b2c";
    script.dataset.origin = "https://widgets.inssmart.ru";
    script.dataset.product = "/mortgage";
    script.dataset.token = process.env.NEXT_PUBLIC_INSSMART_TOKEN ?? "0b980598-dd32-408e-a0a6-8e239c4ea96e";
    script.dataset.secret = process.env.NEXT_PUBLIC_INSSMART_SECRET ?? "127d4c25-b847-4d32-af81-91ed71cfcfab";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.getElementById("inssmart-widget-script")?.remove();
    };
  }, [consented]);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "1");
    setConsented(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-wide text-white bg-brand-600 border border-brand-700 rounded px-2.5 py-1 shadow-sm">
          Партнёрский сервис
        </span>
        <span className="text-[11px] text-gray-600">расчёт и оформление выполняет Inssmart (inssmart.ru)</span>
      </div>

      {consented ? (
        <div id="inssmart-b2c" />
      ) : (
        <div className="bg-gradient-to-b from-white to-brand-50/50 border border-brand-200 rounded-xl p-5 space-y-3">
          <p className="text-xs text-gray-600 leading-relaxed">
            Этот блок — партнёрский сервис. Расчёт стоимости полиса ОСАГО и его оформление выполняет
            компания <b>Inssmart</b> через встроенный калькулятор. Для расчёта вам потребуется ввести
            государственный номер, VIN и паспортные данные —{" "}
            <b>эти данные передаются партнёру Inssmart и страховым компаниям</b> и не хранятся на
            серверах Dogovor.
          </p>
          <label className="flex items-start gap-2.5 text-xs text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 accent-brand-600"
            />
            <span>
              Я согласен(на) на передачу моих персональных данных (госномер, VIN, паспортные данные)
              партнёрскому сервису Inssmart и страховым компаниям для расчёта и оформления полиса ОСАГО
              и ознакомлен(а) с{" "}
              <a href="https://inssmart.ru/privacy/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline inline-flex items-center gap-0.5">
                условиями партнёра <ExternalLink className="w-3 h-3" />
              </a>
            </span>
          </label>
          <button
            onClick={accept}
            disabled={!checked}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-md shadow-brand-500/30 disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all"
          >
            <Shield className="w-4 h-4" />
            Открыть калькулятор ОСАГО
          </button>
          <p className="text-[10px] text-gray-600">
            Согласие действует для этого блока и сохраняется в вашем браузере. Вы можете отозвать его,
            очистив данные сайта (Настройки → Сброс данных).
          </p>
        </div>
      )}
    </div>
  );
}
