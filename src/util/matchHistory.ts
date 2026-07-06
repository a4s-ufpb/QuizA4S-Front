// Histórico local de partidas (single-player e multiplayer), persistido em
// sessionStorage (só token e user ficam no localStorage).

const STORAGE_KEY = "matchHistory";
const MAX_ENTRIES = 20;

export interface MatchHistoryEntry {
  id: number;
  mode: "SINGLE_PLAYER" | "MULTIPLAYER";
  themeName: string;
  score: number;
  total: number;
  date: string;
}

export function getMatchHistory(): MatchHistoryEntry[] {
  try {
    const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(raw) ? (raw as MatchHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addMatchHistoryEntry(
  entry: Omit<MatchHistoryEntry, "id" | "date">
): void {
  const history = getMatchHistory();
  history.unshift({
    ...entry,
    id: Date.now(),
    date: new Date().toISOString(),
  });
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history.slice(0, MAX_ENTRIES))
  );
}

export function clearMatchHistory(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
