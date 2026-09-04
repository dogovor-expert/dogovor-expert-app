/**
 * Канонические сущности (Слой 1 «сущностного» OCR).
 *
 * OCR НЕ должен знать про поля формы (seller_fio, car_vin). Он извлекает
 * СУЩНОСТИ — «человек», «транспортное средство», «компания», «удостоверение».
 * А куда вставить эти значения решает декларативный маппер (см. fieldMap.ts).
 *
 * Это единый контракт между распознавателями (docOcr / docProfiles / docMrz)
 * и слоем подстановки в форму. Новые типы документов добавляются как новые
 * поля сущности, а не как хардкод в сканере.
 */

export interface PersonEntity {
  kind?: "person";
  /** Полное ФИО («Иванов Иван Иванович»). */
  fio?: string;
  surname?: string;
  name?: string;
  patronymic?: string;
  /** Серия паспорта (4 цифры). */
  series?: string;
  /** Номер паспорта (6 цифр). */
  number?: string;
  birthday?: string;
  birthPlace?: string;
  issuedBy?: string;
  issuedDate?: string;
  code?: string;
  address?: string;
  inn?: string;
  snils?: string;
}

export interface VehicleEntity {
  kind?: "vehicle";
  vin?: string;
  plate?: string;
  brand?: string;
  year?: string;
  engine?: string;
  chassis?: string;
  body?: string;
  color?: string;
  powerKw?: string;
  powerHp?: string;
  ptsSeries?: string;
  ptsNumber?: string;
  ptsDate?: string;
  ptsIssuedBy?: string;
  stsSeries?: string;
  stsNumber?: string;
  eptsNumber?: string;
  ownerFio?: string;
}

export interface CompanyEntity {
  kind: "company";
  inn?: string;
  kpp?: string;
  ogrn?: string;
  ogrnip?: string;
  name?: string;
  director?: string;
}

export interface LicenseEntity {
  kind: "license";
  /** Серия/номер ВУ (в объединённом или раздельном виде). */
  series?: string;
  number?: string;
  seriesNumber?: string;
  categories?: string[];
  issueDate?: string;
  expiryDate?: string;
}

export type ExtractedEntity =
  | PersonEntity
  | VehicleEntity
  | CompanyEntity
  | LicenseEntity;

/**
 * Совместимость со старыми именами: PassportData / VehicleData — это те же
 * сущности. Перетаскиваем тип, не ломая существующие import'ы.
 */
export type PassportData = PersonEntity;
export type VehicleData = VehicleEntity;
