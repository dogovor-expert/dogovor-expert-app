import { z } from 'zod';

// ---- Общие схемы для запросов ----

// Схема для создания документа
export const createDocumentSchema = z.object({
  // template_id — это slug шаблона (например "dkp-auto-short"),
  // а не UUID. БД хранит text, и клиент всегда шлёт slug.
  template_id: z.string().min(1).max(100),
  title: z.string().min(1, 'Название обязательно').max(200).optional(),
  fields: z.record(z.string()).optional(),
  checklist: z.record(z.any()).optional(),
  versions: z.array(z.any()).optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

// Схема для обновления профиля
export const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Некорректный номер телефона').optional(),
  company: z.string().max(200).optional(),
  inn: z.string().regex(/^[0-9]{10}$|^[0-9]{12}$/, 'ИНН должен содержать 10 или 12 цифр').optional(),
  avatar_url: z.string().url().optional(),
  signature: z.string().optional(),
  notify_email: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Схема для фидбека (расширенная)
export const feedbackSchema = z.object({
  type: z.enum(['doc_error', 'site_bug', 'feature_request', 'other']),
  email: z.string().email('Некорректный email').max(254),
  message: z.string().min(5, 'Сообщение слишком короткое').max(5000),
  consent: z.literal(true, { errorMap: () => ({ message: 'Необходимо согласие на обработку данных' }) }),
  docSlug: z.string().max(200).optional(),
  docName: z.string().max(200).optional(),
  tool: z.string().max(100).optional(),
  screenshots: z.array(z.object({ dataUrl: z.string().startsWith('data:') })).max(3).optional(),
  tech: z.record(z.any()).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

// Схема для лидов (расширенная)
export const leadSchema = z.object({
  service: z.enum(['docs', 'full', 'kasko']),
  brand: z.string().min(1, 'Бренд обязателен').max(200),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Некорректный номер телефона'),
  vin: z.string().max(17).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

// Схема для webhook ЮKassa (только проверка обязательных полей)
export const yookassaWebhookSchema = z.object({
  event: z.string(),
  object: z.object({
    id: z.string(),
    status: z.string().optional(),
    amount: z.object({
      value: z.string(),
      currency: z.string(),
    }).optional(),
    payment_method: z.object({
      id: z.string().optional(),
    }).optional(),
  }),
});

export type YookassaWebhookInput = z.infer<typeof yookassaWebhookSchema>;

// Схема для DaData-прокси (/api/dadata)
// Поддерживает 8 операций: find-party, suggest-party, suggest-fio, find-fio,
// suggest-passport, suggest-address, suggest-fms-unit, suggest-court.
// query: 1-200 символов, count: 1-10.
export const dadataSchema = z.object({
  op: z.enum([
    'find-party',
    'suggest-party',
    'suggest-fio',
    'find-fio',
    'suggest-passport',
    'suggest-address',
    'suggest-fms-unit',
    'suggest-court',
  ]),
  query: z.string().min(1, 'Запрос не может быть пустым').max(200, 'Максимум 200 символов'),
  count: z.number().int().min(1).max(10).optional().default(10),
}).strict();

export type DadataInput = z.infer<typeof dadataSchema>;

// Схема для чат-виджета (/api/chat)
// Анонимный пользователь может отправить сообщение; visitorId — анонимный ID из cookie,
// text — сообщение (до 4000 символов), consent — обязательное согласие, name/email — контактные данные.
// ctx — опциональный контекст браузера (для отладки и помощи пользователю).
const chatFileSchema = z.object({
  url: z.string().url().max(2000),
  name: z.string().min(1).max(200),
  mime: z.string().min(1).max(120),
  kind: z.enum(['image', 'file']),
  size: z.number().int().nonnegative().max(10 * 1024 * 1024).optional(),
}).strict();

export const chatSchema = z.object({
  visitorId: z.string().min(1, 'visitorId обязателен').max(64),
  text: z.string().max(4000, 'Слишком длинное сообщение').default(''),
  consent: z.literal(true, { errorMap: () => ({ message: 'Необходимо согласие на обработку данных' }) }),
  name: z.string().min(1, 'Имя обязательно').max(80),
  email: z.string().email('Некорректный email').max(254),
  page: z.string().url().max(500).optional(),
  ctx: z.object({
    url: z.string().url().max(500).optional(),
    referrer: z.string().max(500).optional(),
    ua: z.string().max(500).optional(),
    lang: z.string().max(20).optional(),
  }).strict().optional(),
  file: chatFileSchema.optional(),
}).strict();

export type ChatInput = z.infer<typeof chatSchema>;

// Схема для автотеки (/api/autoteka/check)
// vin — обязательный 17-символьный (стандарт ISO 3779).
// plate — опциональный госномер РФ (1 буква + 3 цифры + 2 буквы + 2-3 цифры региона).
// Например: "А123БВ777" или "М999ОК77".
const GOSNOMER_RE = /^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/;

export const autotekaCheckSchema = z.object({
  vin: z.string().regex(/^[A-HJ-NPR-Z0-9]{17}$/i, 'VIN должен содержать ровно 17 символов (без I, O, Q)')
    .transform((v) => v.toUpperCase()),
  plate: z.string().regex(GOSNOMER_RE, 'Госномер в формате А123БВ77 или А123БВ777')
    .transform((v) => v.toUpperCase())
    .optional(),
}).strict();

export type AutotekaCheckInput = z.infer<typeof autotekaCheckSchema>;

// Схема importSchema и тип ImportInput удалены 30.09.2026 вместе с закрытием
// POST /api/import: содержимое документов больше не загружается на сервер,
// черновики переносятся локально в зашифрованное хранилище.

// Схема для создания договора (пакет документов)
export const createContractSchema = z.object({
  template_id: z.string().uuid(),
  fields: z.record(z.string()),
  signer_email: z.string().email().optional(),
  signer_name: z.string().min(1).max(100).optional(),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;

// Схема проверки статуса самозанятого (НПД) по ИНН физлица.
// Дата опциональна: по умолчанию сервер подставляет сегодня (МСК).
export const npdSchema = z.object({
  inn: z.string().regex(/^\d{12}$/, 'ИНН самозанятого должен содержать 12 цифр'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата в формате YYYY-MM-DD').optional(),
}).strict();

// ---- AI-юрист (/api/ai/*) ----

// Вопрос: текст 2-20000 символов, threadId опционален (новый диалог — без него).
// consent — обязательное согласие на обработку (вопрос может содержать ПДн).
// mode: 'chat' — обычный вопрос, 'audit' — проверка договора (длинный текст
// до ~10 страниц, отчёт JSON: индекс + находки; тарифицируется как 1 сообщение).
export const aiChatSchema = z.object({
  text: z.string().min(2, 'Вопрос слишком короткий').max(20000, 'Слишком длинное сообщение'),
  threadId: z.string().uuid('Некорректный threadId').nullish(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Необходимо согласие на обработку данных' }) }),
  mode: z.enum(['chat', 'audit']).optional().default('chat'),
}).strict();

export type AiChatInput = z.infer<typeof aiChatSchema>;

// Пополнение AI-баланса: 100–100 000 ₽ целыми рублями.
export const aiTopupSchema = z.object({
  amountRub: z.number().int().min(100, 'Минимум 100 ₽').max(100000, 'Максимум 100 000 ₽'),
}).strict();

export type AiTopupInput = z.infer<typeof aiTopupSchema>;

// ---- Общие схемы для ответов ----

// Универсальный ответ с данными
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema.optional(),
    error: z.string().optional(),
    success: z.boolean().optional(),
  });

// Пагинация
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ---- Хелпер для валидации ----

import { NextResponse } from 'next/server';

export function validateBody<T>(schema: z.ZodType<T>, body: unknown): 
  | { success: true; data: T }
  | { success: false; error: NextResponse } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const message = Object.entries(errors)
      .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
      .join('; ');
    return {
      success: false as const,
      error: NextResponse.json({ error: message, details: errors }, { status: 400 }),
    };
  }
  return { success: true as const, data: result.data };
}