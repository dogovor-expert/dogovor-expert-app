import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

export async function verifySession() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }
  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // В Server Components нельзя устанавливать cookies через cookieStore.set().
        // Обновление сессии выполняется в middleware, поэтому здесь оставляем пустую функцию.
        setAll: () => {},
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Проверка прав администратора (пример)
  const isAdmin = user.app_metadata?.is_admin === true;

  return {
    user,
    isAdmin,
    userId: user.id,
    email: user.email,
  };
}

// Для использования в Server Actions и компонентах
export async function requireAuth() {
  const session = await verifySession();
  return session;
}

// Для использования в API-роутах (если нужен доступ к клиенту)
export async function getSupabaseClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }
  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // только чтение
      },
    }
  );
}