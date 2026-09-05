'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Info,
  ListChecks,
} from 'lucide-react';
import type { CloudProviderId } from '@/lib/cloud/types';

interface SetupStep {
  id: string;
  title: string;
  body?: ReactNode;
  href?: string;
  copyText?: string;
  copyLabel?: string;
  note?: ReactNode;
  /** Шаг считается выполненным автоматически (например, when Client ID введён). */
  auto?: boolean;
}

interface SetupGuideProps {
  providerId: CloudProviderId;
  clientIdFilled: boolean;
  error?: string | null;
}

interface ErrorHint {
  title: string;
  text: string;
  stepId: string;
}

function buildSteps(providerId: CloudProviderId, origin: string): SetupStep[] {
  const conn = `${origin}/connections`;

  if (providerId === 'yandex') {
    return [
      {
        id: 'create',
        title: 'Создайте приложение',
        body: <>Откройте oauth.yandex.ru/client/new и войдите в Яндекс-аккаунт.</>,
        href: 'https://oauth.yandex.ru/client/new',
      },
      {
        id: 'scopes',
        title: 'Дайте доступ к Яндекс.Диску',
        body: (
          <>
            Платформа — <b>«Веб-сервисы»</b>. В разделе «Доступы» найдите{' '}
            <b>«Яндекс.Диск REST API»</b>: отметьте чтение всего Диска, запись в любом месте и
            информацию о Диске.
          </>
        ),
      },
      {
        id: 'redirect',
        title: 'Укажите Redirect URI',
        body: <>В поле «Callback URL #1» вставьте адрес точно, без пробелов и слеша в конце:</>,
        copyText: conn,
        copyLabel: 'Redirect URI',
      },
      {
        id: 'clientid',
        title: 'Скопируйте Client ID',
        body: <>Со страницы приложения скопируйте поле ID (это не secret).</>,
      },
      {
        id: 'paste',
        title: 'Вставьте Client ID и подключитесь',
        body: (
          <>Перенесите значение из шага выше в поле ввода и нажмите «Подключить» внизу карточки.</>
        ),
        auto: true,
      },
    ];
  }

  if (providerId === 'google') {
    return [
      {
        id: 'console',
        title: 'Откройте консоль Google',
        body: <>Раздел «Учётные данные» — нужен любой Google Cloud-проект.</>,
        href: 'https://console.cloud.google.com/apis/credentials',
        note: (
          <>
            Если Google показывает окно «app is in testing» и не пускает во вход — добавьте свой
            аккаунт в тестеры приложения (OAuth consent screen).
          </>
        ),
      },
      {
        id: 'create',
        title: 'Создайте OAuth Client ID',
        body: (
          <>
            «Создать учётные данные» → <b>OAuth client ID</b> → тип <b>Web application</b>. Поле
            «Authorized redirect URIs» заполнять не нужно — вход работает напрямую.
          </>
        ),
      },
      {
        id: 'js-origins',
        title: 'Добавьте адрес в JavaScript Origins',
        body: (
          <>
            В поле <b>Authorized JavaScript Origins</b> укажите адрес сайта (без /connections):
          </>
        ),
        copyText: origin,
        copyLabel: 'Адрес сайта',
        note: <>Самая частая причина ошибки «origin not registered» — именно это поле.</>,
      },
      {
        id: 'paste',
        title: 'Вставьте Client ID и подключитесь',
        body: (
          <>
            Client ID заканчивается на{' '}
            <code className="rounded bg-gray-100 px-1 text-[11px]">
              .apps.googleusercontent.com
            </code>
            . Вставьте его в поле выше и нажмите «Подключить».
          </>
        ),
        auto: true,
      },
    ];
  }

  return [
    {
      id: 'create',
      title: 'Создайте приложение',
      body: <>Откройте консоль разработчика Dropbox.</>,
      href: 'https://www.dropbox.com/developers/apps/create',
    },
    {
      id: 'api',
      title: 'Выберите тип доступа',
      body: (
        <>
          API — <b>Scoped access</b>; тип — <b>App folder</b> или Full Dropbox на ваш выбор.
        </>
      ),
    },
    {
      id: 'perms',
      title: 'Включите права',
      body: (
        <>
          Вкладка <b>Permissions</b>: files.content.read/write, files.metadata.read/write и
          account_info.read.
        </>
      ),
    },
    {
      id: 'redirect',
      title: 'Укажите Redirect URI',
      body: (
        <>
          Вкладка <b>Settings</b> → Redirect URIs:
        </>
      ),
      copyText: conn,
      copyLabel: 'Redirect URI',
    },
    {
      id: 'paste',
      title: 'Вставьте App key и подключитесь',
      body: <>App key виден на странице приложения — вставьте его в поле выше.</>,
      auto: true,
    },
  ];
}

export default function SetupGuide({ providerId, clientIdFilled, error }: SetupGuideProps) {
  const [open, setOpen] = useState(true);
  const [origin, setOrigin] = useState('');
  const [manualDone, setManualDone] = useState<Record<string, boolean>>({});
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const steps = origin ? buildSteps(providerId, origin) : [];
  const connRef = origin ? `${origin}/connections` : '…адресом этой страницы';

  const describeError = (message: string): ErrorHint | null => {
    if (providerId === 'google') {
      if (/не удалось загрузить google|gsi|gis/i.test(message)) {
        return {
          title: 'Google не смог открыть окно входа',
          text: 'Обновите страницу и повторите попытку. Если это повторяется — очистите кэш и куки сайта и зайдите снова.',
          stepId: 'paste',
        };
      }
      if (/no registered origin|not a valid origin|invalid_client/i.test(message)) {
        return {
          title: 'Google не знает адрес вашего сайта',
          text: `В консоли Google в поле «JavaScript Origins» должен быть указан ${origin}. Без этого Google отвечает «origin not registered».`,
          stepId: 'js-origins',
        };
      }
    }
    if (providerId === 'yandex') {
      if (/закрылось слишком быстро|всплывающ|попап|popup/i.test(message)) {
        return {
          title: 'Окно входа закрылось раньше времени',
          text: 'Разрешите всплывающие окна для этого сайта и повторите. Если окно закрывается снова — проверьте, что Redirect URI указан точно (шаг 3).',
          stepId: 'redirect',
        };
      }
      if (/client id|не указан|неверно|приложение|not found|не найден/i.test(message)) {
        return {
          title: 'Возможно, введён неверный Client ID',
          text: 'Скопируйте именно ID приложения (не secret) со страницы приложения — это шаг 4.',
          stepId: 'clientid',
        };
      }
    }
    return {
      title: 'Не удалось подключиться',
      text: `Проверьте шаги выше: Redirect URI должен совпадать с ${connRef}, а Client ID — скопирован без пробелов.`,
      stepId: 'paste',
    };
  };

  const hint = error ? describeError(error) : null;

  const isDone = (step: SetupStep) => (step.auto ? clientIdFilled : !!manualDone[step.id]);

  const doneCount = steps.filter(isDone).length;
  const total = steps.length;
  const progress = total ? Math.round((doneCount / total) * 100) : 0;

  const toggleStep = (id: string) => setManualDone((prev) => ({ ...prev, [id]: !prev[id] }));

  const copyStep = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedStep(id);
    window.setTimeout(() => {
      setCopiedStep((cur) => (cur === id ? null : cur));
    }, 1500);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-gray-50"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <ListChecks className="h-4 w-4 text-brand-600" />
          Как подключить — 5 минут
        </span>
        <span className="flex items-center gap-2.5">
          <span className="text-[11px] font-medium text-gray-500">
            {doneCount}/{total} готово
          </span>
          <span className="h-1 w-16 overflow-hidden rounded-full bg-gray-100">
            <span
              className="block h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>

      {open && (
        <div className="px-3.5 pb-4 pt-1">
          {hint && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-800">{hint.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-red-700">{hint.text}</p>
                  {error && <p className="mt-1 truncate text-[11px] text-red-400">{error}</p>}
                </div>
              </div>
            </div>
          )}

          {total === 0 ? (
            <p className="py-2 text-xs text-gray-500">Загружаю шаги…</p>
          ) : (
            <ul>
              {steps.map((step, i) => {
                const done = isDone(step);
                const attention = hint?.stepId === step.id;
                const isLast = i === steps.length - 1;
                const copyText = step.copyText;
                return (
                  <li key={step.id} className="relative">
                    {!isLast && (
                      <span
                        aria-hidden
                        className={`absolute left-[13px] top-7 bottom-0 w-px ${
                          done ? 'bg-emerald-200' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    <div className="relative flex items-start gap-3 pb-5">
                      <button
                        type="button"
                        onClick={() => toggleStep(step.id)}
                        aria-label={
                          done
                            ? `Отметить шаг невыполненным: ${step.title}`
                            : `Отметить шаг выполненным: ${step.title}`
                        }
                        className={`mt-0.5 flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                          done
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : attention
                              ? 'border-amber-400 bg-amber-50 text-amber-700'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-brand-400'
                        }`}
                      >
                        {done ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : attention ? (
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                        ) : (
                          <span className="text-[11px] font-semibold">{i + 1}</span>
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${
                            attention ? 'text-amber-800' : 'text-gray-900'
                          }`}
                        >
                          {step.title}
                        </p>
                        {step.body && (
                          <div className="mt-0.5 text-xs leading-relaxed text-gray-600">
                            {step.body}
                          </div>
                        )}

                        {(copyText || step.href) && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {copyText && (
                              <>
                                <code className="max-w-full truncate rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] text-gray-700">
                                  {copyText}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => copyStep(step.id, copyText)}
                                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600 transition-colors hover:border-brand-400 hover:text-brand-600"
                                >
                                  <Copy className="h-3 w-3" />
                                  {copiedStep === step.id ? 'скопировано ✓' : step.copyLabel}
                                </button>
                              </>
                            )}
                            {step.href && (
                              <a
                                href={step.href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-md border border-brand-100 bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 transition-colors hover:bg-brand-100"
                              >
                                Открыть консоль
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        )}

                        {step.note && (
                          <p className="mt-1.5 flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-800">
                            <Info className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-500" />
                            {step.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
