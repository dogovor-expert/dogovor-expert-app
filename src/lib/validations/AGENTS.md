# AGENTS.md — src/lib/validations

## Правила Zod-схем (overrides root)

### Конвенции
- Один schema = один домен (например: `authSchema`, `chatSchema`, `dadataSchema`)
- Имя файла: `api.ts` (для API schemas) или специфичное (`blog.ts`, `dadata.ts`)
- `export type Input = z.infer<typeof mySchema>` — для типизации

### Паттерны
```typescript
// Email
email: z.string().email("Некорректный email").max(254)

// URL
url: z.string().url().max(500)

// Обязательное с сообщением
name: z.string().min(1, "Имя обязательно").max(80)

// С лимитом и дефолтом
count: z.number().int().min(1).max(10).default(10)

// Enum
status: z.enum(["draft", "published"])

// Boolean с приведением
accept: z.union([z.literal("on"), z.literal("true"), z.boolean()]).transform(v => v === true || v === "on")

// Object (strict запрещает неизвестные поля)
metadata: z.object({ ... }).strict()

// Array с ограничениями
tags: z.array(z.string().min(1)).min(1).max(10)
```

### Безопасность
- **Всегда** `.strict()` для объектов (запрет лишних полей)
- **Всегда** ограничение длины строк (защита от DoS)
- **Всегда** валидация `mime` для файлов
- **Запрет** `z.any()` и `z.unknown()` (используй `z.string().transform(JSON.parse)`)
- **Refinement** для cross-field: `.refine(data => data.password === data.confirm, { message: "..." })`

### Переиспользование
- `emailSchema = z.string().email()` — экспортируй для повторного использования
- `paginationSchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) })`
- `idSchema = z.string().uuid()` или `.cuid()` в зависимости от БД

### Запрещено
- `z.string()` без ограничения длины → DoS через огромный input
- `z.object({}).passthrough()` → лазейка для XSS через неизвестные поля
- Кастомные валидаторы без обработки ошибок
- Схемы без тестов (минимум: 1 happy path + 1 validation error)
