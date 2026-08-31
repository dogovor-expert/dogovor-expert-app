'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/document';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';

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
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: initialEmail || '',
      password: '',
    },
    mode: 'onBlur',
  });

  // Если email передан извне — делаем поле readonly и не валидируем отдельно
  if (initialEmail) {
    setValue('email', initialEmail, { shouldValidate: false });
  }

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
    } catch (err) {
      setServerError('Не удалось подключиться к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          {...register('email')}
          error={errors.email?.message}
          aria-invalid={!!errors.email}
          readOnly={!!initialEmail}
          className={initialEmail ? 'bg-gray-50 cursor-not-allowed' : ''}
        />
        {initialEmail && (
          <p className="text-xs text-gray-500 mt-1">Email зафиксирован с предыдущего шага</p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Пароль"
          {...register('password')}
          error={errors.password?.message}
          aria-invalid={!!errors.password}
        />
      </div>

      {serverError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {serverError}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Вход...' : 'Войти'}
      </Button>
    </form>
  );
}