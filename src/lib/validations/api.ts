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

// Схема для создания договора (пакет документов)
export const createContractSchema = z.object({
  template_id: z.string().uuid(),
  fields: z.record(z.string()),
  signer_email: z.string().email().optional(),
  signer_name: z.string().min(1).max(100).optional(),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;

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