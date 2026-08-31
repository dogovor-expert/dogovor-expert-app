import { createClient } from '@/lib/supabase/server';
import { loginSchema, type LoginFormData } from '@/lib/validations/document';
import { validateBody } from '@/lib/validations/api';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = validateBody<LoginFormData>(loginSchema, body);
  if (!validation.success) {
    return validation.error;
  }

  const { email, password } = validation.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ user: data.user, session: data.session });
}