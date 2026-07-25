import type { Theme, User } from "../types";
import { APP_USER_KEY, APP_THEME_KEY } from "./token";

/** Reads and parses the logged-in user persisted in localStorage. */
export function getStoredUser(): User {
  return JSON.parse(localStorage.getItem(APP_USER_KEY) || "{}") as User;
}

/** Reads and parses the currently selected theme persisted in sessionStorage. */
export function getStoredTheme(): Theme {
  return JSON.parse(sessionStorage.getItem(APP_THEME_KEY) || "{}") as Theme;
}

/** Persists the currently selected theme in sessionStorage. */
export function setStoredTheme(theme: Theme): void {
  sessionStorage.setItem(APP_THEME_KEY, JSON.stringify(theme));
}
