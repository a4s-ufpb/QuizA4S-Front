// Registro visual dos cosméticos da loja. O backend só guarda o código do item
// equipado (ex.: "TITLE_LEGEND"); aqui resolvemos o rótulo do título e as
// classes CSS de moldura/banner (definidas em components/cosmetics/cosmetics.css).

/** Rótulo exibido ao lado do nome para cada título. */
export const TITLE_LABELS: Record<string, string> = {
  TITLE_CHAMPION: "Campeão",
  TITLE_LEGEND: "Lenda",
  TITLE_MASTER: "Mestre do Quiz",
  TITLE_ROOKIE: "Novato",
  TITLE_SCHOLAR: "Erudito",
  TITLE_PRODIGY: "Prodígio",
  TITLE_IMMORTAL: "Imortal",
};

/** Classe CSS extra do título (ex.: gradiente animado). "" = estilo padrão. */
export const TITLE_CLASS: Record<string, string> = {
  TITLE_PRODIGY: "cos-title-prodigy",
  TITLE_IMMORTAL: "cos-title-immortal",
};

/** Classe CSS da moldura aplicada ao redor do avatar. */
export const FRAME_CLASS: Record<string, string> = {
  FRAME_GOLD: "cos-frame-gold",
  FRAME_NEON: "cos-frame-neon",
  FRAME_FIRE: "cos-frame-fire",
  FRAME_SILVER: "cos-frame-silver",
  FRAME_RAINBOW: "cos-frame-rainbow",
  FRAME_ICE: "cos-frame-ice",
};

/** Classe CSS do banner (faixa de fundo). */
export const BANNER_CLASS: Record<string, string> = {
  BANNER_OCEAN: "cos-banner-ocean",
  BANNER_SUNSET: "cos-banner-sunset",
  BANNER_FOREST: "cos-banner-forest",
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
