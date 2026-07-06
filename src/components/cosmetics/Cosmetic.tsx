import type { ReactNode } from "react";
import { titleLabel, titleClass, frameClass, bannerClass } from "../../util/cosmetics";
import "./cosmetics.css";

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
