import {
  createContext,
  useState,
  useEffect,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useFindUserQuery } from "../query/useUserQueries";
import { isTokenExpired, clearAuthStorage, migrateLegacyAuthKeys, APP_TOKEN_KEY, APP_USER_KEY } from "../util/token";

// Migra chaves legadas ("token"/"user"/"@token"/"@user") uma vez no load.
migrateLegacyAuthKeys();

interface AuthContextValue {
  isAuthenticated: boolean;
  setAuthenticated: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
}

export const AuthenticationContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  setAuthenticated: () => {},
  loading: false,
});

interface AuthenticationProviderProps {
  children: ReactNode;
}

export const AuthenticationProvider = ({
  children,
}: AuthenticationProviderProps) => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  const rawToken = localStorage.getItem(APP_TOKEN_KEY);
  // Token vencido é tratado como ausência de login: limpa antes mesmo de
  // consultar o backend, pra não disparar chamada fadada a 401 nem manter
  // token/user desatualizados no localStorage.
  if (rawToken && isTokenExpired(rawToken)) {
    clearAuthStorage();
  }
  const token = isTokenExpired(rawToken) ? null : rawToken;

  const findUserQuery = useFindUserQuery(Boolean(token));
  const loading = findUserQuery.isLoading;

  useEffect(() => {
    if (!token) {
      setAuthenticated(false);
      return;
    }
    if (!findUserQuery.data) return;

    if (!findUserQuery.data.success) {
      clearAuthStorage();
      setAuthenticated(false);
      return;
    }

    localStorage.setItem(APP_USER_KEY, JSON.stringify(findUserQuery.data.data));
    setAuthenticated(true);
  }, [findUserQuery.data, token]);

  return (
    <AuthenticationContext.Provider
      value={{ isAuthenticated, setAuthenticated, loading }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
