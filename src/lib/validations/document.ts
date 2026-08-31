import { z } from 'zod';

export const documentSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(200),
  templateId: z.string().uuid('Некорректный ID шаблона'),
  fields: z.record(z.string()).optional(),
  signerEmail: z.string().email('Некорректный email'),
  signerName: z.string().min(1, 'Имя подписанта обязательно').max(100),
  comment: z.string().max(500).optional(),
});

export type DocumentFormData = z.infer<typeof documentSchema>;

// Схема для авторизации
export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Схема для регистрации
export const registerSchema = z
  .object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
    confirmPassword: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
    name: z.string().min(1, 'Имя обязательно').max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;