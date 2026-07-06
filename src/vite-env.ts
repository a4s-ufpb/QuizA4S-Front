// Base da API. Sobrescrevível em build via VITE_API_URL (ex.: stack local
// no docker). Fallback = produção.
export const API_URL =
  import.meta.env.VITE_API_URL ?? "https://quizapp.a4s.dev.br/api/v1";
// Endpoint SockJS/STOMP do modo multiplayer (backend registra "/ws" na raiz).
export const WS_URL =
  import.meta.env.VITE_WS_URL ?? API_URL.replace(/\/v1$/, "") + "/ws";
export const DEFAULT_IMG =
  "https://t3.ftcdn.net/jpg/04/60/01/36/360_F_460013622_6xF8uN6ubMvLx0tAJECBHfKPoNOR5cRa.jpg";
export const PEXELS_CLIENT_ID =
  "VobhRhGYqprkaxYAvXjE07UsDOglWJwSU4cHbpWu0qGphVyZQUGW3CSS";
export const PEXELS_URL = "https://api.pexels.com/v1/search";

// Valores da Pontuação do Quiz (devem espelhar Score.java no backend).
export const HIT_VALUE = 100;
export const REDUCE_VALUE = 0.35;
// Cada acerto vale no mínimo isso — quem acerta ao menos 1 questão nunca zera.
export const MIN_VALUE_PER_HIT = 20;
