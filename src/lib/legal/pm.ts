/**
 * Величины прожиточного минимума по субъектам РФ — данные СФР на 2026 год.
 * Источник: sfr.gov.ru (на душу населения / для трудоспособных / для детей, руб/мес).
 * Используется для расчёта алиментов в твёрдой денежной сумме (ст. 117 СК РФ):
 * кратная ПМ на ребёнка в субъекте по месту жительства получателя,
 * при отсутствии региональной — федеральная ПМ.
 * Обновлять ежегодно (регионы утверждают ПМ постановлениями в ноябре на следующий год).
 */

export interface RegionPm {
  code: string;
  name: string;
  perCapita: number;
  working: number;
  child: number;
}

export const PM_YEAR = 2026;
export const PM_UPDATED = "01.01.2026";

/** ПМ в целом по Российской Федерации на 2026 год. */
export const FEDERAL_PM: RegionPm = {
  code: "000",
  name: "В целом по РФ",
  perCapita: 18939,
  working: 20644,
  child: 18371,
};

/** 89 субъектов РФ + федеральная территория «Сириус», отсортированы по названию. */
export const REGION_PM: RegionPm[] = [
  { code: "22", name: "Алтайский край", perCapita: 16856, working: 18373, child: 16350 },
  { code: "28", name: "Амурская область", perCapita: 21780, working: 23740, child: 21215 },
  { code: "29", name: "Архангельская область", perCapita: 21969, working: 23946, child: 21310 },
  { code: "30", name: "Астраханская область", perCapita: 18371, working: 20024, child: 17820 },
  { code: "31", name: "Белгородская область", perCapita: 15909, working: 17341, child: 15432 },
  { code: "32", name: "Брянская область", perCapita: 17424, working: 18992, child: 16901 },
  { code: "33", name: "Владимирская область", perCapita: 18371, working: 20024, child: 17820 },
  { code: "34", name: "Волгоградская область", perCapita: 16288, working: 17754, child: 15799 },
  { code: "35", name: "Вологодская область", perCapita: 19128, working: 20850, child: 18555 },
  { code: "36", name: "Воронежская область", perCapita: 16666, working: 18166, child: 16166 },
  { code: "99", name: "г. Байконур", perCapita: 18939, working: 20644, child: 18371 },
  { code: "77", name: "г. Москва", perCapita: 25342, working: 28940, child: 21903 },
  { code: "92", name: "г. Севастополь", perCapita: 19318, working: 21057, child: 18738 },
  { code: "93", name: "Донецкая Народная Республика", perCapita: 17803, working: 19405, child: 17269 },
  { code: "79", name: "Еврейская автономная область", perCapita: 23674, working: 25805, child: 22964 },
  { code: "75", name: "Забайкальский край", perCapita: 22159, working: 24153, child: 21494 },
  { code: "96", name: "Запорожская область", perCapita: 18371, working: 20025, child: 17820 },
  { code: "37", name: "Ивановская область", perCapita: 17803, working: 19405, child: 17269 },
  { code: "38", name: "Иркутская область", perCapita: 24411, working: 26609, child: 23679 },
  { code: "39", name: "Калининградская область", perCapita: 19507, working: 21263, child: 18922 },
  { code: "40", name: "Калужская область", perCapita: 18181, working: 19817, child: 17636 },
  { code: "41", name: "Камчатский край", perCapita: 33333, working: 36333, child: 32333 },
  { code: "9", name: "Карачаево-Черкесская Республика", perCapita: 17803, working: 19405, child: 17269 },
  { code: "42", name: "Кемеровская область-Кузбасс", perCapita: 17234, working: 18785, child: 16717 },
  { code: "43", name: "Кировская область", perCapita: 16856, working: 18373, child: 16350 },
  { code: "44", name: "Костромская область", perCapita: 17424, working: 18992, child: 16901 },
  { code: "23", name: "Краснодарский край", perCapita: 18181, working: 19817, child: 17636 },
  { code: "24", name: "Красноярский край", perCapita: 21022, working: 22914, child: 20391 },
  { code: "45", name: "Курганская область", perCapita: 17803, working: 19405, child: 17269 },
  { code: "46", name: "Курская область", perCapita: 16477, working: 17960, child: 15983 },
  { code: "47", name: "Ленинградская область", perCapita: 20265, working: 22089, child: 19657 },
  { code: "48", name: "Липецкая область", perCapita: 15719, working: 17134, child: 15247 },
  { code: "94", name: "Луганская Народная Республика", perCapita: 17803, working: 19405, child: 17269 },
  { code: "49", name: "Магаданская область", perCapita: 32954, working: 35920, child: 32062 },
  { code: "50", name: "Московская область", perCapita: 20286, working: 22112, child: 19677 },
  { code: "51", name: "Мурманская область", perCapita: 26406, working: 28783, child: 25614 },
  { code: "83", name: "Ненецкий автономный округ", perCapita: 31060, working: 33855, child: 32026 },
  { code: "52", name: "Нижегородская область", perCapita: 17803, working: 19405, child: 17269 },
  { code: "53", name: "Новгородская область", perCapita: 18560, working: 20230, child: 18003 },
  { code: "54", name: "Новосибирская область", perCapita: 18560, working: 20230, child: 18003 },
  { code: "55", name: "Омская область", perCapita: 16477, working: 17960, child: 15983 },
  { code: "56", name: "Оренбургская область", perCapita: 16477, working: 17960, child: 15983 },
  { code: "57", name: "Орловская область", perCapita: 17613, working: 19198, child: 17085 },
  { code: "58", name: "Пензенская область", perCapita: 15909, working: 17341, child: 15432 },
  { code: "59", name: "Пермский край", perCapita: 17424, working: 18992, child: 16901 },
  { code: "25", name: "Приморский край", perCapita: 22537, working: 24565, child: 21861 },
  { code: "60", name: "Псковская область", perCapita: 18750, working: 20438, child: 18188 },
  { code: "1", name: "Республика Адыгея", perCapita: 16288, working: 17754, child: 15799 },
  { code: "4", name: "Республика Алтай", perCapita: 17992, working: 19611, child: 17452 },
  { code: "2", name: "Республика Башкортостан", perCapita: 16856, working: 18373, child: 16350 },
  { code: "3", name: "Республика Бурятия", perCapita: 20644, working: 22502, child: 20025 },
  { code: "5", name: "Республика Дагестан", perCapita: 17234, working: 18785, child: 16717 },
  { code: "6", name: "Республика Ингушетия", perCapita: 17803, working: 19405, child: 17269 },
  { code: "8", name: "Республика Калмыкия", perCapita: 18560, working: 20230, child: 18003 },
  { code: "10", name: "Республика Карелия", perCapita: 20812, working: 22685, child: 20188 },
  { code: "11", name: "Республика Коми", perCapita: 21780, working: 23740, child: 21127 },
  { code: "91", name: "Республика Крым", perCapita: 18371, working: 20024, child: 17820 },
  { code: "12", name: "Республика Марий Эл", perCapita: 16666, working: 18166, child: 16166 },
  { code: "13", name: "Республика Мордовия", perCapita: 16098, working: 17547, child: 15615 },
  { code: "14", name: "Республика Саха (Якутия)", perCapita: 33460, working: 36471, child: 32456 },
  { code: "15", name: "Республика Северная Осетия - Алания", perCapita: 17045, working: 18579, child: 16534 },
  { code: "16", name: "Республика Татарстан", perCapita: 16098, working: 17547, child: 15615 },
  { code: "17", name: "Республика Тыва", perCapita: 19128, working: 20850, child: 18554 },
  { code: "19", name: "Республика Хакасия", perCapita: 19318, working: 21057, child: 18738 },
  { code: "61", name: "Ростовская область", perCapita: 17803, working: 19405, child: 17269 },
  { code: "62", name: "Рязанская область", perCapita: 16856, working: 18373, child: 16350 },
  { code: "63", name: "Самарская область", perCapita: 17803, working: 19405, child: 17269 },
  { code: "78", name: "Санкт-Петербург", perCapita: 20644, working: 22502, child: 20025 },
  { code: "64", name: "Саратовская область", perCapita: 15909, working: 17341, child: 15432 },
  { code: "65", name: "Сахалинская область", perCapita: 25757, working: 28075, child: 24984 },
  { code: "66", name: "Свердловская область", perCapita: 18750, working: 20438, child: 18188 },
  { code: "67", name: "Смоленская область", perCapita: 18750, working: 20438, child: 18188 },
  { code: "26", name: "Ставропольский край", perCapita: 17045, working: 18579, child: 16534 },
  { code: "68", name: "Тамбовская область", perCapita: 15719, working: 17134, child: 15247 },
  { code: "69", name: "Тверская область", perCapita: 18560, working: 20230, child: 18003 },
  { code: "70", name: "Томская область", perCapita: 18560, working: 20230, child: 18003 },
  { code: "71", name: "Тульская область", perCapita: 18939, working: 20644, child: 18371 },
  { code: "72", name: "Тюменская область", perCapita: 18939, working: 20644, child: 18371 },
  { code: "18", name: "Удмуртская Республика", perCapita: 16856, working: 18373, child: 16350 },
  { code: "73", name: "Ульяновская область", perCapita: 16856, working: 18373, child: 16350 },
  { code: "199", name: "ФТ Сириус", perCapita: 18181, working: 19817, child: 17636 },
  { code: "27", name: "Хабаровский край", perCapita: 23106, working: 25186, child: 23758 },
  { code: "86", name: "Ханты-Мансийский автономный округ-Югра", perCapita: 22102, working: 24091, child: 22137 },
  { code: "95", name: "Херсонская область", perCapita: 18371, working: 20025, child: 17820 },
  { code: "84", name: "Челябинская область", perCapita: 17424, working: 18992, child: 16901 },
  { code: "20", name: "Чеченская Республика", perCapita: 18181, working: 19817, child: 17636 },
  { code: "21", name: "Чувашская Республика - Чувашия", perCapita: 16477, working: 17960, child: 15983 },
  { code: "87", name: "Чукотский автономный округ", perCapita: 49431, working: 53880, child: 47948 },
  { code: "89", name: "Ямало-Ненецкий автономный округ", perCapita: 25946, working: 28281, child: 25168 },
  { code: "76", name: "Ярославская область", perCapita: 18939, working: 20644, child: 18371 },
];

export function findRegionPm(code: string): RegionPm | undefined {
  return REGION_PM.find((r) => r.code === code);
}

/**
 * ПМ на ребёнка для региона (ст. 117 СК РФ). Без кода региона или при отсутствии
 * региональной величины — федеральная ПМ.
 */
export function childPmForRegion(
  code: string | null | undefined,
): { pm: number; label: string; isFederal: boolean } {
  const r = code ? findRegionPm(code) : undefined;
  if (!r) return { pm: FEDERAL_PM.child, label: FEDERAL_PM.name, isFederal: true };
  return { pm: r.child, label: r.name, isFederal: false };
}
