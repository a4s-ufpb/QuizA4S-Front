import { describe, it, expect } from "vitest";
import { titleLabel, titleClass, frameClass, bannerClass } from "./cosmetics";

describe("cosmetics helpers", () => {
  it("titleLabel retorna o rótulo de um código conhecido", () => {
    expect(titleLabel("TITLE_LEGEND")).toBe("Lenda");
    expect(titleLabel("TITLE_ROOKIE")).toBe("Novato");
  });

  it("titleLabel retorna null para código desconhecido ou vazio", () => {
    expect(titleLabel("NAO_EXISTE")).toBeNull();
    expect(titleLabel(null)).toBeNull();
    expect(titleLabel(undefined)).toBeNull();
    expect(titleLabel("")).toBeNull();
  });

  it("titleClass só devolve classe para títulos especiais", () => {
    expect(titleClass("TITLE_PRODIGY")).toBe("cos-title-prodigy");
    expect(titleClass("TITLE_LEGEND")).toBe(""); // título comum, sem classe extra
    expect(titleClass(null)).toBe("");
  });

  it("frameClass resolve a classe da moldura", () => {
    expect(frameClass("FRAME_GOLD")).toBe("cos-frame-gold");
    expect(frameClass("NAO_EXISTE")).toBe("");
    expect(frameClass(undefined)).toBe("");
  });

  it("bannerClass resolve a classe do banner", () => {
    expect(bannerClass("BANNER_GALAXY")).toBe("cos-banner-galaxy");
    expect(bannerClass(null)).toBe("");
  });
});
