/** Emojis pré-definidos usados como avatar de jogadores/equipes no multiplayer, por categoria. */
export const AVATAR_CATEGORIES: Record<string, string[]> = {
  Animais: [
    "🦁", "🐯", "🐻", "🐼", "🐨", "🦊", "🐵", "🐸",
    "🐧", "🦄", "🐙", "🦉", "🐢", "🐲", "🦖", "🐝",
  ],
  Robôs: ["🤖", "👾", "🦾", "🛸", "⚙️", "🔧", "💾", "🖥️"],
  Fantasia: ["🧙", "🧝", "🧛", "🧟", "🧞", "🥷", "🦸", "🦹"],
  Esportes: ["⚽", "🏀", "🏈", "🎾", "🏆", "🎮", "🎯", "🏹"],
  Comida: ["🍕", "🍔", "🍩", "🍦", "🍉", "🥑", "🍪", "🌮"],
};

// Nível mínimo (Perfil > XP) pra desbloquear cada categoria de avatar.
export const AVATAR_CATEGORY_UNLOCK_LEVEL: Record<string, number> = {
  Animais: 1,
  Robôs: 2,
  Fantasia: 3,
  Esportes: 4,
  Comida: 5,
};

export const AVATAR_OPTIONS: string[] = Object.values(AVATAR_CATEGORIES).flat();

export function randomAvatar(): string {
  const defaultTier = AVATAR_CATEGORIES.Animais;
  return defaultTier[Math.floor(Math.random() * defaultTier.length)];
}
