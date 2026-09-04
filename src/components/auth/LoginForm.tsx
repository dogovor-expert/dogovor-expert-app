'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/document';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useEffect, useState } from 'react';

interface LoginFormProps {
  onSuccess?: () => void;
  initialEmail?: string;
}

export function LoginForm({ onSuccess, initialEmail }: LoginFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: initialEmail || '',
      password: '',
    },
    mode: 'onBlur',
  });

  // Если email передан извне — делаем поле readonly и не валидируем отдельно.
  // useEffect: заполняем только при изменении initialEmail, а не на каждом рендере.
  useEffect(() => {
    if (initialEmail) {
      setValue('email', initialEmail, { shouldValidate: false });
    }
  }, [initialEmail, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.error || 'Ошибка входа');
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = '/dashboard';
      }
    } catch {
      setServerError('Не удалось подключиться к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => { void handleSubmit(onSubmit)(e); }} className="space-y-4" noValidate>
      <div>
        <Input
          id="login-email"
          type="email"
          label="Email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          aria-describedby={errors.email?.message ? 'login-email-err' : undefined}
          aria-invalid={!!errors.email}
          {...register('email')}
          error={errors.email?.message}
          readOnly={!!initialEmail}
          className={initialEmail ? 'bg-gray-50 cursor-not-allowed' : ''}
        />
        {initialEmail && (
          <p className="text-xs text-gray-500 mt-1">Email зафиксирован с предыдущего шага</p>
        )}
      </div>

      <div>
        <Input
          id="login-password"
          type="password"
          label="Пароль"
          autoComplete="current-password"
          aria-describedby={errors.password?.message ? 'login-password-err' : undefined}
          aria-invalid={!!errors.password}
          {...register('password')}
          error={errors.password?.message}
        />
      </div>

      {serverError && (
        <div
          role="alert"
          aria-live="assertive"
          className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
        >
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full"
      >
        {isLoading ? 'Вход...' : 'Войти'}
      </Button>
    </form>
  );
}