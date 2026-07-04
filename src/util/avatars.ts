/** Emojis pré-definidos usados como avatar de jogadores/equipes no multiplayer. */
export const AVATAR_OPTIONS: string[] = [
  "🦁",
  "🐯",
  "🐻",
  "🐼",
  "🐨",
  "🦊",
  "🐵",
  "🐸",
  "🐧",
  "🦄",
  "🐙",
  "🦉",
  "🐢",
  "🐲",
  "🦖",
  "🐝",
];

export function randomAvatar(): string {
  return AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
}
