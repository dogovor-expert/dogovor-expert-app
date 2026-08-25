// PKCE (RFC 7636) + генерация state для безопасных OAuth в браузере.
// Используется Яндекс (implicit token — без PKCE) и Dropbox/Google (PKCE).

export interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
}

function base64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function createPKCE(): Promise<PKCEPair> {
  // code_verifier: 43-128 символов, unreserved chars
  const verifierBytes = crypto.getRandomValues(new Uint8Array(32));
  const codeVerifier = base64url(verifierBytes);
  // code_challenge = base64url(sha256(code_verifier))
  const digest = await crypto.subtle.digest("SHA-256", verifierBytes);
  const codeChallenge = base64url(new Uint8Array(digest));
  const stateBytes = crypto.getRandomValues(new Uint8Array(16));
  const state = base64url(stateBytes);
  return { codeVerifier, codeChallenge, state };
}

export function buildAuthUrl(
  base: string,
  params: Record<string, string>
): string {
  const sp = new URLSearchParams(params);
  return `${base}?${sp.toString()}`;
}

/** Открывает OAuth в попапе; возвращает промис, который резолвится фрагментом/кодом. */
export function openAuthPopup(
  url: string,
  opts: { width?: number; height?: number } = {}
): Promise<string> {
  const width = opts.width ?? 600;
  const height = opts.height ?? 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  const popup = window.open(
    url,
    "oauth",
    `width=${width},height=${height},left=${left},top=${top}`
  );
  if (!popup) throw new Error("Попап заблокирован браузером — разрешите всплывающие окна для этого сайта");

  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        const waited = Date.now() - startedAt;
        reject(
          new Error(
            waited < 2000
              ? "Окно авторизации закрылось слишком быстро — проверьте, что браузер не блокирует всплывающие окна"
              : "Авторизация не завершена. Если в окне была ошибка вида «приложение не найдено» — Client ID указан неверно. Проверьте его и Redirect URI по инструкции на этой странице"
          )
        );
      }
      try {
        // Читаем location — сработает после редиректа на наш origin
        const href = popup.location.href;
        const hash = popup.location.hash;
        if (hash && (hash.includes("access_token=") || hash.includes("code=") || hash.includes("error="))) {
          clearInterval(timer);
          popup.close();
          resolve(hash);
        }
        if (href.includes("code=") || href.includes("error=")) {
          clearInterval(timer);
          popup.close();
          resolve(href);
        }
      } catch {
        // cross-origin — пока провайдер не вернул нас на свой origin
      }
    }, 100);
  });
}

/** Для redirect flow (Dropbox PKCE): парсим code из URL текущей страницы */
export function parseCodeFromUrl(url: string = window.location.href): string | null {
  try {
    const u = new URL(url);
    return u.searchParams.get("code");
  } catch {
    return null;
  }
}

/** Парсим access_token из фрагмента (Yandex implicit, Google token model) */
export function parseTokenFromFragment(
  fragment: string
): { accessToken: string; expiresIn?: number; tokenType?: string } | null {
  const params = new URLSearchParams(fragment.startsWith("#") ? fragment.slice(1) : fragment);
  const accessToken = params.get("access_token");
  if (!accessToken) return null;
  return {
    accessToken,
    expiresIn: params.get("expires_in") ? parseInt(params.get("expires_in")!, 10) : undefined,
    tokenType: params.get("token_type") || undefined,
  };
}