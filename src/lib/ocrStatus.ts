/**
 * Утилита для клиента (браузер): проверка доступности occular-сервера.
 *
 * Использует /api/ocr-status (который в свою очередь пингует домашний occular /health
 * через Tailscale Funnel с серверной стороны Vercel — клиенту НЕ нужен прямой доступ).
 *
 * Не бросает ошибок: при любом сбое возвращает { available: false, reason }.
 * Результат можно кешировать в компоненте на 5-10 секунд, чтобы не спамить /api.
 */

export interface OcularStatus {
  available: boolean;
  reason: string;
  languages?: string;
  threads?: number;
  status?: string;
  checked_at?: string;
}

const DEFAULT_TIMEOUT_MS = 4_000;

/**
 * Простой circuit breaker для occular-сервера.
 *
 * Защищает от «каскадных» таймаутов: если occular (домашний ПК через Tailscale)
 * упал или стал недоступен, после N подряд идущих сбоев breaker открывается и
 * UI сразу отдаёт «Базовый режим» — без реальных HTTP-запросов в течение
 * `cooldownMs`. Через cooldown переходит в half-open и пробует один раз.
 */
export class OcularCircuitBreaker {
  private failures = 0;
  private openedAt = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private readonly threshold = 3,
    private readonly cooldownMs = 60_000
  ) {}

  /** Текущее состояние. */
  isOpen(): boolean {
    // Если таймаут прошёл — переходим в half-open (разрешаем одну пробу).
    if (this.state === 'open' && Date.now() - this.openedAt >= this.cooldownMs) {
      this.state = 'half-open';
    }
    return this.state === 'open';
  }

  /** Начало запроса: вернёт false, если breaker считает, что запрос НЕ нужно делать. */
  canProceed(): boolean {
    return !this.isOpen();
  }

  /** Успешный ответ — закрываем breaker. */
  onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  /** Сбой — увеличиваем счётчик и, при пороге, открываем breaker. */
  onFailure(): void {
    if (this.state === 'half-open') {
      this.failures = 1;
      this.state = 'closed';
    } else {
      this.failures += 1;
    }
    if (this.failures >= this.threshold) {
      this.state = 'open';
      this.openedAt = Date.now();
    }
  }

  /** Сброс (например, при повторном монтировании). */
  reset(): void {
    this.failures = 0;
    this.state = 'closed';
  }
}

/** Общий breaker для проверки доступности + проксирования (модульный синглтон). */
const occularBreaker = new OcularCircuitBreaker();

export function resetOcularBreaker(): void {
  occularBreaker.reset();
}

export async function fetchOcularStatus(
  signal?: AbortSignal,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<OcularStatus> {
  // Circuit breaker: если сервер «открыт» — не дёргаем /api.
  if (!occularBreaker.canProceed()) {
    return { available: false, reason: 'circuit_open' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const onOuterAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onOuterAbort, { once: true });
  }

  try {
    const res = await fetch('/api/ocr-status', {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) {
      occularBreaker.onFailure();
      return { available: false, reason: `http_${res.status}` };
    }
    const data = (await res.json()) as OcularStatus;
    if (data.available) occularBreaker.onSuccess();
    else occularBreaker.onFailure();
    return data;
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    occularBreaker.onFailure();
    return {
      available: false,
      reason: isAbort ? 'client_timeout' : 'network_error',
    };
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener('abort', onOuterAbort);
  }
}

export interface OcularProxyLine {
  text: string;
  confidence: number;
  quad: number[][];
}

export interface OcularProxyResult {
  ok: boolean;
  source: 'server' | 'client-fallback';
  reason?: string;
  lines: OcularProxyLine[];
  cached?: boolean;
  upstream_elapsed_ms?: number;
  elapsed_ms: number;
}

/**
 * TICKET-1 (152-ФЗ): серверный OCR допустим только после явного opt-in
 * пользователя. Чистая функция — единый источник правды для UI-гейта;
 * на сервере то же условие обеспечивается проверкой profiles.ocr_consent_at
 * в /api/ocr-proxy (403 consent_required).
 */
export function shouldUseServerOcr(
  status: OcularStatus | null,
  consentGiven: boolean
): boolean {
  return Boolean(status?.available) && consentGiven;
}

/** Ключ localStorage для согласия на серверный OCR. */
export const OCR_CONSENT_STORAGE_KEY = "dogovor:ocr-server-consent";

const PROXY_TIMEOUT_MS = 60_000;

export async function postOcrRequest(
  blob: Blob,
  filename: string,
  signal?: AbortSignal
): Promise<OcularProxyResult> {
  // Circuit breaker: если сервер в «открытом» состоянии — сразу к клиентскому fallback.
  if (!occularBreaker.canProceed()) {
    return {
      ok: false,
      source: 'client-fallback',
      reason: 'circuit_open',
      lines: [],
      elapsed_ms: 0,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
  const onOuterAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onOuterAbort, { once: true });
  }

  try {
    const form = new FormData();
    form.append('file', blob, filename);
    const res = await fetch('/api/ocr-proxy', {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    if (!res.ok) {
      occularBreaker.onFailure();
      return {
        ok: false,
        source: 'client-fallback',
        reason: `http_${res.status}`,
        lines: [],
        elapsed_ms: 0,
      };
    }
    const data = (await res.json()) as OcularProxyResult;
    if (data.source === 'server') occularBreaker.onSuccess();
    else occularBreaker.onFailure();
    return data;
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    occularBreaker.onFailure();
    return {
      ok: false,
      source: 'client-fallback',
      reason: isAbort ? 'client_timeout' : 'network_error',
      lines: [],
      elapsed_ms: 0,
    };
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener('abort', onOuterAbort);
  }
}
