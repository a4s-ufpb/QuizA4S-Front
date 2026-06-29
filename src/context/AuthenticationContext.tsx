import {
  createContext,
  useState,
  useEffect,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { UserService } from "../service/UserService";

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
  const [loading, setLoading] = useState(false);

  const userService = new UserService();

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function checkToken() {
      setLoading(true);
      const response = await userService.findUser();

      if (!response.success) {
        localStorage.clear();
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      setLoading(false);
      const userDetails = response.data;
      localStorage.setItem("user", JSON.stringify(userDetails));

      setAuthenticated(true);
    }

    checkToken();
  }, [token]);

  return (
    <AuthenticationContext.Provider
      value={{ isAuthenticated, setAuthenticated, loading }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
