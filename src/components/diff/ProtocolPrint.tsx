import type { Protocol } from "@/lib/protocol";

/**
 * Печатная форма протокола разногласий. Тот же узел используется и для
 * предпросмотра на экране, и для печати/PDF (react-to-print), и как основа
 * DOCX-экспорта (см. protocolHtml).
 */
export default function ProtocolPrint({ protocol }: { protocol: Protocol }) {
  const { meta, rows } = protocol;
  const p1 = meta.party1.trim() || "Сторона 1";
  const p2 = meta.party2.trim() || "Сторона 2";
  const place = [meta.city.trim(), meta.date.trim()].filter(Boolean).join(", ");

  return (
    <div className="bg-white text-gray-900 text-[12px] leading-relaxed p-8 sm:p-10 border border-gray-200 rounded-2xl shadow-soft">
      <h3 className="text-center text-base font-extrabold tracking-tight">
        ПРОТОКОЛ РАЗНОГЛАСИЙ
      </h3>
      <p className="text-center mt-1">
        к договору{meta.contractKind.trim() ? ` ${meta.contractKind.trim()}` : ""}
        {meta.contractNumber.trim() ? ` № ${meta.contractNumber.trim()}` : ""}
        {meta.contractDate.trim() ? ` от ${meta.contractDate.trim()}` : ""}
      </p>
      {place && <p className="mt-4">{place}</p>}

      <p className="mt-4">
        {p1} и {p2}, совместно именуемые «Стороны», при заключении договора не
        пришли к соглашению по отдельным условиям и составили настоящий протокол
        разногласий о нижеследующем:
      </p>

      <table className="w-full mt-6 border-collapse text-[11px]">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 text-left w-[8%]">№</th>
            <th className="border border-gray-300 p-2 text-left w-[12%]">Пункт</th>
            <th className="border border-gray-300 p-2 text-left w-[27%]">
              Редакция: {p1}
            </th>
            <th className="border border-gray-300 p-2 text-left w-[27%]">
              Редакция: {p2}
            </th>
            <th className="border border-gray-300 p-2 text-left w-[26%]">
              Согласованная редакция
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="border border-gray-300 p-2 align-top">{i + 1}</td>
              <td className="border border-gray-300 p-2 align-top">
                {r.clause || "—"}
              </td>
              <td className="border border-gray-300 p-2 align-top whitespace-pre-wrap">
                {r.ours.trim() || "—"}
              </td>
              <td className="border border-gray-300 p-2 align-top whitespace-pre-wrap">
                {r.theirs.trim() || "—"}
              </td>
              <td className="border border-gray-300 p-2 align-top whitespace-pre-wrap">
                {r.agreed.trim() ? (
                  r.agreed
                ) : (
                  <em className="text-gray-500">Пункт исключить</em>
                )}
                {r.critical && (
                  <strong className="block mt-1 text-red-700">
                    (принципиальное разногласие)
                  </strong>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4">
        Настоящий протокол разногласий является неотъемлемой частью указанного
        договора. Согласованные в нём условия применяются с даты подписания
        договора, а при отсутствии согласия — спор передаётся на рассмотрение
        суда в порядке, установленном законодательством Российской Федерации
        (ст. 443, 445 ГК РФ).
      </p>

      <p className="mt-6">Подписи Сторон:</p>
      <div className="grid grid-cols-2 gap-6 mt-2">
        <div>
          {p1}
          <div className="mt-8 border-t border-gray-400 pt-1 text-gray-500">
            подпись / расшифровка
          </div>
        </div>
        <div>
          {p2}
          <div className="mt-8 border-t border-gray-400 pt-1 text-gray-500">
            подпись / расшифровка
          </div>
        </div>
      </div>
    </div>
  );
}
