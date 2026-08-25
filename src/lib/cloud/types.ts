// Единый интерфейс провайдеров облачных дисков.
// Реализации для Яндекс.Диск, Google Drive, Dropbox.

export interface CloudTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number; // Date.now() + expires_in*1000
  scope?: string;
  provider: CloudProviderId;
  tokenType?: string;
}

export type CloudProviderId = "yandex" | "google" | "dropbox";

export interface CloudProvider {
  id: CloudProviderId;
  name: string;
  description: string;
  /** Определяет redirect_uri (должен совпадать с настройкой в консоли провайдера) */
  getRedirectUri(): string;
  /** URL для запуска OAuth (popup или redirect) */
  buildAuthUrl(config: CloudConfig): string;
  /** Обмен кода/фрагмента на токены (если нужен обмен) */
  exchangeCodeForTokens(
    config: CloudConfig,
    codeOrFragment: string
  ): Promise<CloudTokens>;
  /** Обновление access_token (если поддерживается провайдером) */
  refreshTokens?(tokens: CloudTokens): Promise<CloudTokens>;
  /** Загрузка файла в облако */
  uploadFile(
    tokens: CloudTokens,
    path: string,
    blob: Blob,
    contentType?: string
  ): Promise<{ id: string; url?: string }>;
  /** Скачивание файла */
  downloadFile(tokens: CloudTokens, path: string): Promise<Blob>;
  /** Получение информации о пользователе/диске (для проверки подключения) */
  getUserInfo(tokens: CloudTokens): Promise<{ name?: string; email?: string }>;
}

export interface CloudConfig {
  clientId: string;
  clientSecret?: string; // только для Dropbox PKCE (не используется, оставлено для расширения)
  redirectUri: string;
  scopes: string[];
}