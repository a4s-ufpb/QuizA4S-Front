import axios, { type InternalAxiosRequestConfig, type AxiosError } from "axios";
import { API_URL } from "../vite-env";
import { isTokenExpired, clearAuthStorage, APP_TOKEN_KEY } from "../util/token";

export const apiAxios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(APP_TOKEN_KEY);
    if (token && isTokenExpired(token)) {
      // Não anexa token vencido e já limpa o localStorage pra evitar conflito.
      clearAuthStorage();
    } else if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
