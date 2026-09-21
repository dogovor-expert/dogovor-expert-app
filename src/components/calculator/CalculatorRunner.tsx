"use client";

import dynamic from "next/dynamic";

const InnValidator = dynamic(() => import("@/components/calculator/InnValidator"), { ssr: false });
const Nds = dynamic(() => import("@/components/calculator/Nds"), { ssr: false });
const CourtFee = dynamic(() => import("@/components/calculator/CourtFee"), { ssr: false });
const Interest395 = dynamic(() => import("@/components/calculator/Interest395"), { ssr: false });
const SalaryDelay236 = dynamic(() => import("@/components/calculator/SalaryDelay236"), { ssr: false });
const ZhkhPenalty = dynamic(() => import("@/components/calculator/ZhkhPenalty"), { ssr: false });
const Alimony = dynamic(() => import("@/components/calculator/Alimony"), { ssr: false });
const ContractPenalty = dynamic(() => import("@/components/calculator/ContractPenalty"), { ssr: false });
const Indexation208 = dynamic(() => import("@/components/calculator/Indexation208"), { ssr: false });
const FeesIp = dynamic(() => import("@/components/calculator/FeesIp"), { ssr: false });
const Ndfl = dynamic(() => import("@/components/calculator/Ndfl"), { ssr: false });
const NdflSale = dynamic(() => import("@/components/calculator/NdflSale"), { ssr: false });
const UsnNpd = dynamic(() => import("@/components/calculator/UsnNpd"), { ssr: false });
const Vacation = dynamic(() => import("@/components/calculator/Vacation"), { ssr: false });
const TransportTax = dynamic(() => import("@/components/calculator/TransportTax"), { ssr: false });
const PddFines = dynamic(() => import("@/components/calculator/PddFines"), { ssr: false });
const UtilSb = dynamic(() => import("@/components/calculator/UtilSb"), { ssr: false });
const CustomsDuty = dynamic(() => import("@/components/calculator/CustomsDuty"), { ssr: false });
const KaskoQuote = dynamic(() => import("@/components/calculator/KaskoQuote"), { ssr: false });
const Validators = dynamic(() => import("@/components/calculator/Validators"), { ssr: false });
const SumWords = dynamic(() => import("@/components/calculator/SumWords"), { ssr: false });
const DayCounter = dynamic(() => import("@/components/calculator/DayCounter"), { ssr: false });

/**
 * Маппинг id калькулятора → компонент. Ключи совпадают с `CalculatorTool.id`
 * (data/calculator-tools.ts) и с id инструментов в UtilsTools.tsx.
 */
const COMPONENTS: Record<string, React.ComponentType> = {
  docs: InnValidator,
  nds: Nds,
  fee: CourtFee,
  "395": Interest395,
  "236": SalaryDelay236,
  zhkh: ZhkhPenalty,
  alimony: Alimony,
  penalty: ContractPenalty,
  index: Indexation208,
  ipfees: FeesIp,
  ndfl: Ndfl,
  ndflsale: NdflSale,
  usnnpd: UsnNpd,
  vacation: Vacation,
  transport: TransportTax,
  pdd: PddFines,
  utilsb: UtilSb,
  customs: CustomsDuty,
  kasko: KaskoQuote,
  valid: Validators,
  words: SumWords,
  days: DayCounter,
};

/**
 * Монтирует компонент конкретного калькулятора по его id.
 * Используется на SEO-страницах `/utils/[tool]`.
 */
export default function CalculatorRunner({ id }: { id: string }) {
  const Component = COMPONENTS[id];
  if (!Component) return null;
  return <Component />;
}
