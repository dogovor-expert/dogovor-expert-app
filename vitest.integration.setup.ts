import {} from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Глобальная настройка для интеграционных тестов
// Используется реальный Supabase (локальный или тестовый)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
// Локальный Supabase выдаёт ключи при `npx supabase start`.
// В окружении — SUPABASE_SERVICE_ROLE_KEY (в CI задаётся из supabase status).
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!supabaseKey) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY не задан: интеграционные тесты требуют локальный Supabase (npx supabase start)'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Хелпер для создания тестового пользователя
export async function createTestUser(email?: string) {
  const testEmail = email || `test-${Date.now()}@example.com`;
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: 'TestPassword123!',
    email_confirm: true,
  });
  if (error) throw error;
  return { user: data.user, email: testEmail };
}

// Хелпер для удаления тестового пользователя
export async function deleteTestUser(userId: string) {
  await supabaseAdmin.auth.admin.deleteUser(userId);
}

// Очистка таблиц между тестами
export async function clearTable(table: string) {
  await supabaseAdmin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
}