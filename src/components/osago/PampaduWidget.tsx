"use client";
import { useEffect, useState } from "react";
import { Shield, ExternalLink } from "lucide-react";

const WIDGET_SRC = "https://osago.dogovor.expert/40c88608-5c99-45be-ac42-231f5045e5b7";
const RESIZER_SCRIPT = "https://ppdu.ru/ppdw.js";
const CONSENT_KEY = "dogovor_pampadu_osago_consent_v1";

export default function PampaduWidget() {
  const [consented, setConsented] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(CONSENT_KEY) === "1") {
      setConsented(true);
    }
  }, []);

  useEffect(() => {
    if (!consented) return;
    if (document.getElementById("ppdu-resizer")) return;
    const script = document.createElement("script");
    script.id = "ppdu-resizer";
    script.src = RESIZER_SCRIPT;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.getElementById("ppdu-resizer")?.remove();
    };
  }, [consented]);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "1");
    setConsented(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
          Партнёрский сервис
        </span>
        <span className="text-[10px] text-gray-400">расчёт и оформление выполняет Pampadu (pampadu.ru)</span>
      </div>

      {consented ? (
        <iframe
          src={WIDGET_SRC}
          id="ppdwiOffer"
          scrolling="no"
          title="ОСАГО онлайн — партнёрский сервис Pampadu"
          style={{ width: "100%", border: "none", minWidth: 320, overflow: "hidden" }}
        />
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs text-gray-600 leading-relaxed">
            Этот блок — партнёрский сервис. Расчёт стоимости полиса ОСАГО и его оформление выполняет
            компания <b>Pampadu</b> через встроенный калькулятор. Для расчёта вам потребуется ввести
            государственный номер, VIN и паспортные данные —{" "}
            <b>эти данные передаются партнёру Pampadu и страховым компаниям</b> и не хранятся на
            серверах Dogovor. Наш собственный справочный калькулятор доступен ниже на этой странице.
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
              партнёрскому сервису Pampadu и страховым компаниям для расчёта и оформления полиса ОСАГО
              и ознакомлен(а) с{" "}
              <a href="https://pampadu.ru" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline inline-flex items-center gap-0.5">
                условиями партнёра <ExternalLink className="w-3 h-3" />
              </a>
            </span>
          </label>
          <button
            onClick={accept}
            disabled={!checked}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Shield className="w-4 h-4" />
            Открыть калькулятор ОСАГО
          </button>
          <p className="text-[10px] text-gray-400">
            Согласие действует для этого блока и сохраняется в вашем браузере. Вы можете отозвать его,
            очистив данные сайта (Настройки → Сброс данных).
          </p>
        </div>
      )}
    </div>
  );
}