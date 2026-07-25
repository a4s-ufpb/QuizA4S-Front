// Utilidades de token JWT no cliente. O backend valida o token de verdade;
// aqui só olhamos o campo `exp` para evitar mandar um token já vencido e
// limpar o localStorage proativamente (evita "conflitos" de sessão).

// Chaves de storage próprias da aplicação (evita colisão com outras apps
// hospedadas no mesmo domínio e evita nomes genéricos como "token"/"user").
export const APP_TOKEN_KEY = "quiz-a4s:token";
export const APP_USER_KEY = "quiz-a4s:user";
export const APP_THEME_KEY = "quiz-a4s:theme";

// Chaves legadas mantidas apenas para migração/limpeza.
const LEGACY_KEYS = ["token", "user", "@token", "@user"];

/**
 * Migra valores das chaves legadas para as novas, se ainda não houver valor
 * na chave nova. Chamado uma vez no bootstrap da autenticação.
 */
export function migrateLegacyAuthKeys(): void {
  const legacyToken = localStorage.getItem("token") ?? localStorage.getItem("@token");
  const legacyUser = localStorage.getItem("user") ?? localStorage.getItem("@user");
  if (legacyToken && !localStorage.getItem(APP_TOKEN_KEY)) {
    localStorage.setItem(APP_TOKEN_KEY, legacyToken);
  }
  if (legacyUser && !localStorage.getItem(APP_USER_KEY)) {
    localStorage.setItem(APP_USER_KEY, legacyUser);
  }
  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
}

interface JwtPayload {
  exp?: number;
}

/** Decodifica o payload do JWT sem validar assinatura (só leitura de claims). */
function decodePayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** true se o token não existe, é inválido, ou já passou do `exp`. */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const payload = decodePayload(token);
  if (!payload?.exp) return false; // sem exp: deixa o backend decidir
  // exp vem em segundos desde epoch.
  return payload.exp * 1000 <= Date.now();
}

/** Remove token e user do localStorage (usado no logout e ao detectar sessão expirada). */
export function clearAuthStorage(): void {
  localStorage.removeItem(APP_TOKEN_KEY);
  localStorage.removeItem(APP_USER_KEY);
  // Chaves legadas de versões anteriores (defensivo).
  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
}
