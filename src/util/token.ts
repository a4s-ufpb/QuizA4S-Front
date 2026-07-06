// Utilidades de token JWT no cliente. O backend valida o token de verdade;
// aqui só olhamos o campo `exp` para evitar mandar um token já vencido e
// limpar o localStorage proativamente (evita "conflitos" de sessão).

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

/** Remove token e user do localStorage (usado ao detectar sessão expirada). */
export function clearAuthStorage(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
