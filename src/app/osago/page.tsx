import { Calculator, Shield } from "lucide-react";
import InzuroWidget from "@/components/osago/InzuroWidget";

// E4 (аудит): страница была целиком 'use client' — поисковики получали пустой
// HTML (thin content). Теперь это серверный компонент с SEO-контентом, а виджет
// Inzuro остаётся клиентским островом ('use client' внутри InzuroWidget).
export default function OsagoPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-lg shadow-brand-500/40 ring-2 ring-brand-300/50">
          <Calculator className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">ОСАГО</h1>
          <p className="text-sm text-gray-600">
            Расчёт и оформление полиса у партнёра онлайн.
          </p>
        </div>
      </div>

      <div className="bg-white border border-brand-200 rounded-2xl overflow-hidden shadow-lg shadow-brand-500/10">
        <div className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-5">
          <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">ОСАГО онлайн — расчёт и оформление</h2>
            <p className="text-sm text-brand-50/90">
              Сравните предложения страховых компаний и оформите полис за пару минут.
            </p>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <InzuroWidget />
        </div>
      </div>

      <section className="prose-sm space-y-4 text-gray-700 leading-relaxed">
        <h2 className="text-xl font-bold text-gray-900">Что такое ОСАГО и почему без него нельзя</h2>
        <p>
          ОСАГО — обязательное страхование автогражданской ответственности. По закону
          «Об ОСАГО» (ФЗ-40) каждый владелец транспортного средства обязан иметь
          действующий полис: он покрывает ущерб, который вы причинили чужому автомобилю,
          имуществу или здоровью в ДТП по вашей вине. Езда без полиса — штраф 800 рублей
          при каждой остановке, а при повторных нарушениях камера может выписывать
          штрафы автоматически.
        </p>
        <p>
          Оформить ОСАГО можно онлайн: расчёт стоимости занимает пару минут, электронный
          полис (е-ОСАГО) имеет ту же юридическую силу, что и бумажный. При оформлении
          через партнёрский калькулятор вы сравниваете предложения сразу нескольких
          страховых компаний и выбираете лучшую цену.
        </p>

        <h2 className="text-xl font-bold text-gray-900">От чего зависит цена полиса</h2>
        <p>
          Стоимость ОСАГО рассчитывается по тарифам Центробанка и зависит от:
          региона регистрации владельца (коэффициент территории), мощности двигателя,
          возраста и стажа водителей, вписанных в полис (КВС), истории страховых случаев
          (КБМ — бонус-малус), а также периода использования автомобиля. Один и тот же
          водитель у разных страховых может получить разную цену — поэтому перед
          покупкой стоит сравнить предложения.
        </p>

        <h2 className="text-xl font-bold text-gray-900">Частые вопросы</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900">Е-ОСАГО действует так же, как бумажный полис?</h3>
            <p>
              Да. Электронный полис равнозначен бумажному: инспектор ГИБДД проверяет его
              по базе РСА, а при ДТП страховая выплата ничем не отличается.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Можно ли оформить ОСАГО на другого водителя?</h3>
            <p>
              Полис оформляется на собственника автомобиля, но управлять могут несколько
              водителей, вписанных в полис (или «неограниченный» вариант).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Что делать после покупки полиса?</h3>
            <p>
              Сохраните PDF-версию полиса на телефоне. Данные автоматически попадают в
              базу РСА — распечатка не обязательна, но её удобно иметь при себе.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
