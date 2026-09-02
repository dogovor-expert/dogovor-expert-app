import { Loader2, Search, Star } from "lucide-react";

interface PartyData {
  inn?: string;
  kpp?: string;
}

interface PartyResult {
  value: string;
  data: PartyData;
  prefix: string;
}

interface DadataPanelProps {
  subscriptionActive: boolean;
  dadataKey: string;
  onKeyChange: (key: string) => void;
  partyQuery: string;
  onQueryChange: (q: string) => void;
  partyResults: PartyResult[];
  partyAnalyzing: boolean;
  dadataLoading: boolean;
  dadataMsg: { text: string; ok: boolean } | null;
  onSearch: () => void;
  onApplyResult: (r: PartyResult) => void;
  onClearResults: () => void;
}

export default function DadataPanel({
  subscriptionActive,
  dadataKey,
  onKeyChange,
  partyQuery,
  onQueryChange,
  partyResults,
  partyAnalyzing,
  dadataLoading,
  dadataMsg,
  onSearch,
  onApplyResult,
  onClearResults,
}: DadataPanelProps) {
  return (
    <div className="space-y-3">
      {subscriptionActive ? (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
          <Star className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
          <p className="text-[10px] leading-relaxed text-emerald-700">
            Активная подписка: автозаполнение реквизитов по ИНН
            работает автоматически, ваш ключ не требуется.
          </p>
        </div>
      ) : (
        <input
          type="text"
          value={dadataKey}
          onChange={(e) => onKeyChange(e.target.value)}
          placeholder="API-ключ DADATA (необязательно)"
          className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
        />
      )}
      <div className="space-y-2">
        <label className="block text-[10px] font-medium text-gray-600">
          Поиск организации по названию или ИНН
        </label>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={partyQuery}
            onChange={(e) => {
              onQueryChange(e.target.value);
              if (partyResults.length > 0) onClearResults();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSearch();
              }
            }}
            placeholder="Например: ООО Ромашка или ИНН"
            className="flex-1 min-w-0 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          <button
            onClick={onSearch}
            disabled={partyAnalyzing}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 transition-colors flex-shrink-0"
          >
            {partyAnalyzing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        {partyResults.length > 0 && (
          <div className="space-y-1">
            {partyResults.map((r, i) => (
              <button
                key={i}
                onClick={() => onApplyResult(r)}
                className="w-full text-left px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors"
              >
                <p className="text-[11px] font-medium text-gray-800 truncate">
                  {r.value}
                </p>
                <p className="text-[10px] text-gray-600">
                  {r.data?.inn || "ИНН —"}
                  {r.data?.kpp ? ` • КПП ${r.data.kpp}` : ""}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
      {dadataLoading && (
        <p className="text-[10px] text-gray-600">
          Загрузка данных ЕГРЮЛ...
        </p>
      )}
      {dadataMsg && (
        <p
          className={`text-[10px] ${
            dadataMsg.ok ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {dadataMsg.text}
        </p>
      )}
      <p className="text-[10px] leading-relaxed text-gray-600">
        {subscriptionActive
          ? "Запросы обрабатываются серверным прокси (ключ на сервере)."
          : "Бесплатный план: подстановка по ИНН работает через ваш ключ (бесплатный тариф dadata.ru → «Профиль» → API-ключ). При покупке подписки поле исчезает и всё работает автоматически."}
      </p>
    </div>
  );
}
