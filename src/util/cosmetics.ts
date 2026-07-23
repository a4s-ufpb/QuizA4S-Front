// Registro visual dos cosméticos da loja. O backend só guarda o código do item
// equipado (ex.: "TITLE_LEGEND"); aqui resolvemos o rótulo do título e as
// classes CSS de moldura/banner (definidas em components/cosmetics/cosmetics.css).

/** Rótulo exibido ao lado do nome para cada título. */
export const TITLE_LABELS: Record<string, string> = {
  TITLE_ROOKIE: "Novato",
  TITLE_APPRENTICE: "Aprendiz",
  TITLE_CHAMPION: "Campeão",
  TITLE_SCHOLAR: "Erudito",
  TITLE_STRATEGIST: "Estrategista",
  TITLE_MASTER: "Mestre do Quiz",
  TITLE_GENIUS: "Gênio",
  TITLE_PRODIGY: "Prodígio",
  TITLE_LEGEND: "Lenda",
  TITLE_MYTHIC: "Mítico",
  TITLE_IMMORTAL: "Imortal",
  TITLE_GALACTIC: "Galáctico",
};

/** Classe CSS extra do título (ex.: gradiente animado). "" = estilo padrão. */
export const TITLE_CLASS: Record<string, string> = {
  TITLE_GENIUS: "cos-title-genius",
  TITLE_PRODIGY: "cos-title-prodigy",
  TITLE_MYTHIC: "cos-title-mythic",
  TITLE_IMMORTAL: "cos-title-immortal",
  TITLE_GALACTIC: "cos-title-galactic",
};

/** Classe CSS da moldura aplicada ao redor do avatar. */
export const FRAME_CLASS: Record<string, string> = {
  FRAME_BRONZE: "cos-frame-bronze",
  FRAME_SILVER: "cos-frame-silver",
  FRAME_NEON: "cos-frame-neon",
  FRAME_GOLD: "cos-frame-gold",
  FRAME_EMERALD: "cos-frame-emerald",
  FRAME_ICE: "cos-frame-ice",
  FRAME_FIRE: "cos-frame-fire",
  FRAME_AMETHYST: "cos-frame-amethyst",
  FRAME_RAINBOW: "cos-frame-rainbow",
  FRAME_ROYAL: "cos-frame-royal",
};

/** Classe CSS do banner (faixa de fundo). */
export const BANNER_CLASS: Record<string, string> = {
  BANNER_MEADOW: "cos-banner-meadow",
  BANNER_OCEAN: "cos-banner-ocean",
  BANNER_FOREST: "cos-banner-forest",
  BANNER_SUNSET: "cos-banner-sunset",
  BANNER_CANDY: "cos-banner-candy",
  BANNER_CYBER: "cos-banner-cyber",
  BANNER_LAVA: "cos-banner-lava",
  BANNER_GALAXY: "cos-banner-galaxy",
  BANNER_AURORA: "cos-banner-aurora",
};

export function titleLabel(code: string | null | undefined): string | null {
  return code ? TITLE_LABELS[code] ?? null : null;
}

export function titleClass(code: string | null | undefined): string {
  return code ? TITLE_CLASS[code] ?? "" : "";
}

export function frameClass(code: string | null | undefined): string {
  return code ? FRAME_CLASS[code] ?? "" : "";
}

export function bannerClass(code: string | null | undefined): string {
  return code ? BANNER_CLASS[code] ?? "" : "";
}

// ---------- cosméticos do nome (CSS puro) ----------

/** Família de fonte aplicada ao nome do jogador. */
export const FONT_FAMILY: Record<string, string> = {
  FONT_MONO: "'Courier New', ui-monospace, monospace",
  FONT_UNBOUNDED: "'Unbounded', 'Poppins', sans-serif",
  FONT_RETRO: "'VT323', monospace",
  FONT_BUNGEE: "'Bungee', 'Poppins', sans-serif",
  FONT_PIXEL: "'Press Start 2P', 'Poppins', sans-serif",
};

/** Classe CSS de estilo estrutural do nome (negrito/itálico/sublinhado/…). */
export const NAME_STYLE_CLASS: Record<string, string> = {
  STYLE_BOLD: "cos-name-bold",
  STYLE_ITALIC: "cos-name-italic",
  STYLE_UNDERLINE: "cos-name-underline",
  STYLE_STRIKE: "cos-name-strike",
  STYLE_UPPERCASE: "cos-name-uppercase",
  STYLE_SPACED: "cos-name-spaced",
};

/** Classe CSS de efeito de cor/animação do nome. */
export const NAME_EFFECT_CLASS: Record<string, string> = {
  EFFECT_GOLD: "cos-name-gold",
  EFFECT_GRADIENT: "cos-name-gradient",
  EFFECT_SHINE: "cos-name-shine",
  EFFECT_GLOW: "cos-name-glow",
  EFFECT_RAINBOW: "cos-name-rainbow",
  EFFECT_WAVE: "cos-name-wave",
  EFFECT_GLITCH: "cos-name-glitch",
};

export function fontFamily(code: string | null | undefined): string | undefined {
  return code ? FONT_FAMILY[code] : undefined;
}

export function nameStyleClass(code: string | null | undefined): string {
  return code ? NAME_STYLE_CLASS[code] ?? "" : "";
}

export function nameEffectClass(code: string | null | undefined): string {
  return code ? NAME_EFFECT_CLASS[code] ?? "" : "";
}

/** Efeito onda precisa quebrar o nome em letras (animação escalonada por letra). */
export function isPerLetterEffect(code: string | null | undefined): boolean {
  return code === "EFFECT_WAVE";
}
