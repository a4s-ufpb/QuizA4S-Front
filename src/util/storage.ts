import type { Theme, User } from "../types";

/** Reads and parses the logged-in user persisted in localStorage. */
export function getStoredUser(): User {
  return JSON.parse(localStorage.getItem("user") || "{}") as User;
}

/** Reads and parses the currently selected theme persisted in localStorage. */
export function getStoredTheme(): Theme {
  return JSON.parse(localStorage.getItem("theme") || "{}") as Theme;
}
