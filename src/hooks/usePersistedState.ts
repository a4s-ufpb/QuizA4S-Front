import { useEffect, useState } from "react";

/**
 * useState que persiste valor em sessionStorage por uma chave.
 * Restaura no primeiro render; escreve a cada mudança.
 *
 * Uso: filtros de listagens que devem sobreviver a navegação/remontagem
 * (troca de aba, ir num item e voltar, etc.) até que o usuário limpe.
 */
export function usePersistedState<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const stored = sessionStorage.getItem(key);
      if (stored == null) return initial;
      return JSON.parse(stored) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore quota / private mode */
    }
  }, [key, value]);

  return [value, setValue];
}
