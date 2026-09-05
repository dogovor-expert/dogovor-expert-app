# AGENTS.md — src/components

## Правила UI (overrides root)

### Компоненты
- **Server Components по умолчанию**, `"use client"` только где нужна интерактивность
- Один компонент — один файл (кроме тесно связанных партиалов)
- Названия: PascalCase, `index.ts` реэкспортирует наружу
- Props — отдельный `interface ComponentNameProps` экспортируемый, для тестирования

### Стилизация
- **Tailwind** utility classes, mobile-first
- **lucide-react** иконки (импортировать по одному, не barrel)
- Цвета: `brand-*` (основной), `emerald-*` (success), `red-*` (error), `amber-*` (warning)
- Spacing: `p-2/3/4`, `gap-2/3`, избегай magic numbers
- Dark mode: не использовать (нет в дизайне)

### A11y (обязательно)
- Все кнопки — `<button type="button">` (НЕ `<div onClick>`)
- Все интерактивные элементы — keyboard accessible (Tab, Enter, Escape)
- Формы — `<label htmlFor>` или `aria-label`
- Иконки без текста — `aria-label`
- Иконки с текстом — `aria-hidden`
- `role="dialog"` + `aria-modal` + `aria-labelledby` для модалок
- Focus management: autoFocus + focus-trap для модалок

### React 19
- `use()` hook для promises (заменяет useEffect+setState)
- `useFormStatus`, `useFormState` для форм
- Server Actions вместо API routes где возможно
- `useOptimistic` для UI feedback

### State management
- Локальный state → `useState` / `useReducer`
- Глобальный state → `zustand` (см. src/lib/store/)
- Form state → `react-hook-form` + Zod
- Server state → SWR или React Query (НЕ используется сейчас)

### Запрещено
- Inline `style={{...}}` (используй Tailwind)
- `dangerouslySetInnerHTML` без DOMPurify
- `useEffect` для derived state (вычисляй на лету)
- Прямой `fetch` в client component без loading/error states
- `console.log` в production коде (используй Sentry)
