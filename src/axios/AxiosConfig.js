import axios from "axios";
import { API_URL } from "../vite-env";

export const apiAxios = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
})

apiAxios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  }, error => {
    return Promise.reject(error);
  });
