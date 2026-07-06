import type { Theme, User } from "../types";

/** Reads and parses the logged-in user persisted in localStorage. */
export function getStoredUser(): User {
  return JSON.parse(localStorage.getItem("user") || "{}") as User;
}

/** Reads and parses the currently selected theme persisted in sessionStorage. */
export function getStoredTheme(): Theme {
  return JSON.parse(sessionStorage.getItem("theme") || "{}") as Theme;
}

/** Persists the currently selected theme in sessionStorage. */
export function setStoredTheme(theme: Theme): void {
  sessionStorage.setItem("theme", JSON.stringify(theme));
}
