import { describe, it, expect, beforeEach } from "vitest";
import { getGuestId, getGuestName, setGuestName } from "./guest";

describe("guest identity", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("getGuestId cria e persiste um id estável", () => {
    const first = getGuestId();
    const second = getGuestId();
    expect(first).toBeTruthy();
    expect(first).toBe(second); // mesmo id na mesma sessão
  });

  it("getGuestName retorna vazio por padrão e persiste após setGuestName", () => {
    expect(getGuestName()).toBe("");
    setGuestName("Fulano");
    expect(getGuestName()).toBe("Fulano");
  });
});
