import type { CSSProperties, ReactNode } from "react";
import {
  titleLabel,
  titleClass,
  frameClass,
  bannerClass,
  fontFamily,
  nameStyleClass,
  nameEffectClass,
  isPerLetterEffect,
} from "../../util/cosmetics";
import "./cosmetics.css";

/**
 * Nome do jogador com os cosméticos de nome aplicados (fonte, estilo e efeito).
 * Tudo CSS puro — o efeito "onda" quebra o nome em letras para a animação
 * escalonada. Sem cosméticos, renderiza o nome normal.
 */
export function PlayerName({
  name,
  font,
  style,
  effect,
  sx,
}: {
  name: string;
  font?: string | null;
  style?: string | null;
  effect?: string | null;
  sx?: CSSProperties;
}) {
  const className = `cos-name ${nameStyleClass(style)} ${nameEffectClass(effect)}`.trim();
  const inline: CSSProperties = { fontFamily: fontFamily(font), ...sx };

  if (isPerLetterEffect(effect)) {
    return (
      <span className={className} style={inline}>
        {Array.from(name).map((ch, i) => (
          <span key={i} className="cos-name-letter" style={{ ["--i" as string]: i } as CSSProperties}>
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
    );
  }
  return (
    <span className={className} style={inline}>
      {name}
    </span>
  );
}

/** Título equipado exibido ao lado do nome (ou nada, se não houver). */
export function TitleBadge({ code }: { code?: string | null }) {
  const label = titleLabel(code);
  if (!label) return null;
  return (
    <span
      className={`cos-title ${titleClass(code)}`}
      style={{
        marginLeft: 6,
        padding: "1px 6px",
        borderRadius: 6,
        border: "1px solid rgba(0,0,0,0.15)",
        color: titleClass(code) ? undefined : "#7a5cff",
      }}
    >
      {label}
    </span>
  );
}

/**
 * Envolve um avatar (emoji ou ícone) com a moldura equipada. Se não houver
 * moldura, renderiza o conteúdo direto.
 */
export function FramedAvatar({
  code,
  size = 32,
  children,
}: {
  code?: string | null;
  size?: number;
  children: ReactNode;
}) {
  const cls = frameClass(code);
  if (!cls) return <>{children}</>;
  return (
    <span
      className={`cos-frame ${cls}`}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      <span
        style={{
          background: "#fff",
          borderRadius: "50%",
          width: "100%",
          height: "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </span>
    </span>
  );
}

/** Classe do banner equipado, pra aplicar como fundo de uma linha/card. */
export function bannerClassName(code?: string | null): string {
  return bannerClass(code);
}
