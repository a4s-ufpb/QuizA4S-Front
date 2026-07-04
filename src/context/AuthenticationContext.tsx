import {
  createContext,
  useState,
  useEffect,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useFindUserQuery } from "../query/useUserQueries";

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

  const token = localStorage.getItem("token");

  const findUserQuery = useFindUserQuery(Boolean(token));
  const loading = findUserQuery.isLoading;

  useEffect(() => {
    if (!token) {
      setAuthenticated(false);
      return;
    }
    if (!findUserQuery.data) return;

    if (!findUserQuery.data.success) {
      localStorage.clear();
      setAuthenticated(false);
      return;
    }

    localStorage.setItem("user", JSON.stringify(findUserQuery.data.data));
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
