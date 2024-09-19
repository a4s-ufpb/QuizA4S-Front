import { createContext, useState, useEffect } from "react";
import { URL_BASE } from "../vite-env";
import {UserService} from "../service/UserService"

export const AuthenticationContext = createContext();

export const AuthenticationProvider = ({ children }) => {
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
      const userDetails = response.data
      localStorage.setItem("user", JSON.stringify(userDetails))

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
