export interface KoapFine {
  article: string;
  part: number;
  title: string;
  fineMin: number | null;
  fineMax: number | null;
  punish: "fine" | "fineOrRevoke" | "fineOrArrest" | "fineAndRevoke" | "revokeOrArrest";
  revokeMonths?: [number, number];
  arrestDays?: [number, number];
  noDiscount?: boolean;
  repeatText?: string;
  cameraAllowed?: boolean;
}

export const KOAP_CHAPTER_12: KoapFine[] = [
  { article: "12.1", part: 1, title: "Управление ТС, не зарегистрированным в установленном порядке", fineMin: 500, fineMax: 800, punish: "fine", repeatText: "повторно (ч. 1.1) — 5 000 ₽ или лишение 1–3 мес" },
  { article: "12.1", part: 1.1, title: "Повторное управление ТС, не зарегистрированным в установленном порядке", fineMin: 5000, fineMax: 5000, punish: "fineOrRevoke", revokeMonths: [1, 3], noDiscount: true },
  { article: "12.2", part: 1, title: "Управление ТС с нечитаемыми, нестандартными или видоизменёнными госномерами", fineMin: 500, fineMax: 500, punish: "fine" },
  { article: "12.2", part: 2, title: "Управление ТС без госномеров или с скрытыми/подложными номерами", fineMin: 5000, fineMax: 5000, punish: "fineOrRevoke", revokeMonths: [1, 3] },
  { article: "12.3", part: 1, title: "Управление ТС без регистрационных документов, ВУ или полиса ОСАГО", fineMin: 500, fineMax: 500, punish: "fine" },
  { article: "12.5", part: 1, title: "Управление ТС при неисправностях, при которых эксплуатация запрещена", fineMin: 500, fineMax: 500, punish: "fine" },
  { article: "12.5", part: 3.1, title: "Несоблюдение сезонности шин (шипованная/летняя не по сезону)", fineMin: 500, fineMax: 500, punish: "fine" },
  { article: "12.6", part: 0, title: "Управление ТС водителем, не пристёгнутым ремнём безопасности, или перевозка непристёгнутых пассажиров", fineMin: 1000, fineMax: 1000, punish: "fine" },
  { article: "12.7", part: 1, title: "Управление ТС водителем, не имеющим права управления", fineMin: 5000, fineMax: 15000, punish: "fine" },
  { article: "12.7", part: 2, title: "Управление ТС водителем, лишённым права управления", fineMin: 30000, fineMax: 30000, punish: "fineOrArrest", arrestDays: [1, 15] },
  { article: "12.8", part: 1, title: "Управление ТС в состоянии опьянения", fineMin: 45000, fineMax: 45000, punish: "fineAndRevoke", revokeMonths: [18, 24], noDiscount: true, repeatText: "повторно — 50 000–100 000 ₽ или лишение 3 года (уголовная ст. 264.1 УК)" },
  { article: "12.8", part: 2, title: "Передача управления лицу, находящемуся в состоянии опьянения", fineMin: 45000, fineMax: 45000, punish: "fineAndRevoke", revokeMonths: [18, 24], noDiscount: true },
  { article: "12.9", part: 2, title: "Превышение установленной скорости на 20–40 км/ч", fineMin: 500, fineMax: 500, punish: "fine" },
  { article: "12.9", part: 3, title: "Превышение скорости на 40–60 км/ч", fineMin: 1000, fineMax: 1500, punish: "fine", repeatText: "повторно (ч. 6) — 2 000–2 500 ₽ или лишение 2–4 мес" },
  { article: "12.9", part: 4, title: "Превышение скорости на 60–80 км/ч", fineMin: 2000, fineMax: 2500, punish: "fineOrRevoke", revokeMonths: [4, 6], repeatText: "повторно (ч. 7) — 5 000–7 000 ₽ или лишение до 1 года" },
  { article: "12.9", part: 5, title: "Превышение скорости более чем на 80 км/ч", fineMin: 5000, fineMax: 5000, punish: "fineOrRevoke", revokeMonths: [6, 6] },
  { article: "12.9", part: 6, title: "Повторное превышение скорости на 40–60 км/ч", fineMin: 2000, fineMax: 2500, punish: "fineOrRevoke", revokeMonths: [2, 4], noDiscount: true },
  { article: "12.9", part: 7, title: "Повторное превышение скорости на 60 км/ч и более", fineMin: 5000, fineMax: 7000, punish: "fineOrRevoke", revokeMonths: [6, 12], noDiscount: true },
  { article: "12.10", part: 1, title: "Выезд на железнодорожный переезд при закрытом шлагбауме либо остановка на переезде", fineMin: 5000, fineMax: 5000, punish: "fineOrRevoke", revokeMonths: [3, 6], noDiscount: true },
  { article: "12.12", part: 1, title: "Проезд на запрещающий сигнал светофора или жест регулировщика", fineMin: 1000, fineMax: 1000, punish: "fine", repeatText: "повторно (ч. 3) — 5 000 ₽ или лишение 4–6 мес" },
  { article: "12.12", part: 2, title: "Повторный проезд на запрещающий сигнал", fineMin: 5000, fineMax: 5000, punish: "fineOrRevoke", revokeMonths: [4, 6], noDiscount: true },
  { article: "12.13", part: 2, title: "Невыполнение требования уступить дорогу ТС, пользующемуся преимуществом на перекрёстке", fineMin: 1000, fineMax: 1000, punish: "fine" },
  { article: "12.14", part: 1.1, title: "Разворот или движение задним ходом в местах, где это запрещено", fineMin: 500, fineMax: 500, punish: "fine" },
  { article: "12.15", part: 1, title: "Нарушение правил расположения ТС на проезжей части, встречный разъезд", fineMin: 1500, fineMax: 1500, punish: "fine" },
  { article: "12.15", part: 2, title: "Движение по велосипедным или пешеходным дорожкам", fineMin: 2000, fineMax: 2000, punish: "fine" },
  { article: "12.15", part: 3, title: "Выезд на встречную полосу при объезде препятствия", fineMin: 1000, fineMax: 1500, punish: "fine" },
  { article: "12.15", part: 4, title: "Выезд на встречную полосу, где это запрещено (обгон)", fineMin: 5000, fineMax: 5000, punish: "fineOrRevoke", revokeMonths: [4, 6], repeatText: "повторно (ч. 5) — лишение 1 год" },
  { article: "12.15", part: 5, title: "Повторный выезд на встречную полосу", fineMin: null, fineMax: null, punish: "revokeOrArrest", revokeMonths: [12, 12], noDiscount: true, cameraAllowed: false },
  { article: "12.16", part: 1, title: "Несоблюдение требований дорожных знаков или разметки", fineMin: 500, fineMax: 500, punish: "fine" },
  { article: "12.16", part: 2, title: "Поворот налево или разворот в местах, где это запрещено", fineMin: 1000, fineMax: 1500, punish: "fine" },
  { article: "12.16", part: 3, title: "Движение во встречном направлении по дороге с односторонним движением", fineMin: 5000, fineMax: 5000, punish: "fineOrRevoke", revokeMonths: [4, 6], repeatText: "повторно (ч. 3.1) — лишение 1 год" },
  { article: "12.16", part: 3.1, title: "Повторное встречное движение по дороге с односторонним движением", fineMin: 5000, fineMax: 5000, punish: "fineOrRevoke", revokeMonths: [12, 12], noDiscount: true },
  { article: "12.17", part: 1.1, title: "Непредоставление преимущества маршрутному ТС или ТС со спецсигналами", fineMin: 3000, fineMax: 3000, punish: "fine" },
  { article: "12.18", part: 0, title: "Непредоставление преимущества пешеходам или велосипедистам", fineMin: 1500, fineMax: 2500, punish: "fine" },
  { article: "12.19", part: 1, title: "Нарушение правил остановки или стоянки ТС", fineMin: 500, fineMax: 500, punish: "fine" },
  { article: "12.19", part: 2, title: "Остановка или стоянка на местах для инвалидов", fineMin: 5000, fineMax: 5000, punish: "fine" },
  { article: "12.19", part: 3, title: "Остановка или стоянка на пешеходном переходе или тротуаре (кроме Москвы и СПб)", fineMin: 1000, fineMax: 1000, punish: "fine" },
  { article: "12.19", part: 3.2, title: "То же в Москве или Санкт-Петербурге", fineMin: 3000, fineMax: 3000, punish: "fine" },
  { article: "12.19", part: 3.1, title: "Остановка или стоянка на остановке маршрутных ТС", fineMin: 1000, fineMax: 1000, punish: "fine", repeatText: "в Москве и СПб — 3 000 ₽ (ч. 3.2)" },
  { article: "12.19", part: 4, title: "Остановка в тоннеле или создание препятствия другим ТС", fineMin: 2000, fineMax: 2000, punish: "fine", repeatText: "в Москве и СПб — 3 000 ₽" },
  { article: "12.21.1", part: 1, title: "Движение крупногабаритного/тяжеловесного ТС с превышением допустимых габаритов или нагрузки", fineMin: 1000, fineMax: 1500, punish: "fine" },
  { article: "12.24", part: 1, title: "Нарушение ПДД, повлёкшее причинение лёгкого вреда здоровью потерпевшего", fineMin: 2500, fineMax: 5000, punish: "fineOrRevoke", revokeMonths: [12, 18], noDiscount: true },
  { article: "12.24", part: 2, title: "Нарушение ПДД, повлёкшее вред здоровью средней тяжести", fineMin: 10000, fineMax: 25000, punish: "fineOrRevoke", revokeMonths: [18, 24], noDiscount: true },
  { article: "12.26", part: 1, title: "Отказ от медицинского освидетельствования на состояние опьянения", fineMin: 45000, fineMax: 45000, punish: "fineAndRevoke", revokeMonths: [18, 24], noDiscount: true, repeatText: "повторно — уголовная ответственность (ст. 264.1 УК)" },
  { article: "12.27", part: 1, title: "Невыполнение обязанностей в связи с ДТП (не остановился, не включил аварийку)", fineMin: 1000, fineMax: 1000, punish: "fine" },
  { article: "12.27", part: 2, title: "Оставление водителем места ДТП, участником которого он являлся", fineMin: null, fineMax: null, punish: "revokeOrArrest", revokeMonths: [12, 18], arrestDays: [1, 15], cameraAllowed: false },
  { article: "12.27", part: 3, title: "Употребление алкоголя/наркотических средств после ДТП до освидетельствования", fineMin: 30000, fineMax: 30000, punish: "fineAndRevoke", revokeMonths: [18, 24], noDiscount: true },
  { article: "12.29", part: 1, title: "Нарушение ПДД пешеходом или пассажиром", fineMin: 500, fineMax: 500, punish: "fine" },
  { article: "12.29", part: 2, title: "Нарушение ПДД пешеходом в состоянии опьянения", fineMin: 1000, fineMax: 1500, punish: "fine" },
  { article: "12.32", part: 0, title: "Допуск к управлению ТС водителя, находящегося в состоянии опьянения", fineMin: 30000, fineMax: 30000, punish: "fine" },
  { article: "12.37", part: 1, title: "Управление ТС в период использования, не предусмотренный полисом ОСАГО", fineMin: 800, fineMax: 800, punish: "fine" },
  { article: "12.37", part: 2, title: "Управление ТС при заведомо отсутствующем ОСАГО", fineMin: 800, fineMax: 800, punish: "fine" },
];

export function discountDeadline(issuedAt: string): string {
  const d = new Date(issuedAt + "T00:00:00");
  d.setDate(d.getDate() + 30);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fineWithDiscount(f: KoapFine): number | null {
  if (f.noDiscount) return null;
  if (f.fineMin === null || f.fineMax === null) return null;
  const amount = f.fineMax;
  return Math.round(amount * 0.75);
}

export function fineLabel(f: KoapFine): string {
  if (f.fineMin === null || f.fineMax === null) return "Штраф не предусмотрен";
  if (f.fineMin === f.fineMax) return f.fineMin.toLocaleString("ru-RU") + " ₽";
  return `${f.fineMin.toLocaleString("ru-RU")}–${f.fineMax.toLocaleString("ru-RU")} ₽`;
}

export function punishLabel(p: KoapFine["punish"]): string {
  switch (p) {
    case "fine": return "штраф";
    case "fineOrRevoke": return "штраф или лишение прав";
    case "fineAndRevoke": return "штраф + лишение прав";
    case "fineOrArrest": return "штраф или арест";
    case "revokeOrArrest": return "лишение прав или арест";
  }
}