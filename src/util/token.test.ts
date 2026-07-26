import { describe, it, expect, beforeEach } from "vitest";
import {
  APP_TOKEN_KEY,
  APP_USER_KEY,
  clearAuthStorage,
  isTokenExpired,
  migrateLegacyAuthKeys,
} from "./token";

describe("migrateLegacyAuthKeys", () => {
  beforeEach(() => localStorage.clear());

  it("copia token legado 'token' para APP_TOKEN_KEY", () => {
    localStorage.setItem("token", "old-token");
    migrateLegacyAuthKeys();
    expect(localStorage.getItem(APP_TOKEN_KEY)).toBe("old-token");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("copia token legado '@token' para APP_TOKEN_KEY", () => {
    localStorage.setItem("@token", "at-token");
    migrateLegacyAuthKeys();
    expect(localStorage.getItem(APP_TOKEN_KEY)).toBe("at-token");
    expect(localStorage.getItem("@token")).toBeNull();
  });

  it("não sobrescreve APP_TOKEN_KEY já existente", () => {
    localStorage.setItem(APP_TOKEN_KEY, "new-token");
    localStorage.setItem("token", "old-token");
    migrateLegacyAuthKeys();
    expect(localStorage.getItem(APP_TOKEN_KEY)).toBe("new-token");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("migra também 'user' e '@user'", () => {
    localStorage.setItem("user", "{\"name\":\"A\"}");
    migrateLegacyAuthKeys();
    expect(localStorage.getItem(APP_USER_KEY)).toBe("{\"name\":\"A\"}");
    expect(localStorage.getItem("user")).toBeNull();
  });
});

describe("clearAuthStorage", () => {
  beforeEach(() => localStorage.clear());

  it("remove chaves atuais e legadas", () => {
    localStorage.setItem(APP_TOKEN_KEY, "t");
    localStorage.setItem(APP_USER_KEY, "u");
    localStorage.setItem("token", "old");
    localStorage.setItem("@user", "old");
    clearAuthStorage();
    expect(localStorage.getItem(APP_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(APP_USER_KEY)).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("@user")).toBeNull();
  });
});

describe("isTokenExpired", () => {
  it("null/vazio conta como expirado", () => {
    expect(isTokenExpired(null)).toBe(true);
    expect(isTokenExpired("")).toBe(true);
  });

  it("token sem exp: não expirado (deixa backend decidir)", () => {
    // header.payload.signature — payload = {} sem exp
    const empty = btoa(JSON.stringify({}));
    expect(isTokenExpired(`h.${empty}.s`)).toBe(false);
  });

  it("token com exp no passado: expirado", () => {
    const past = btoa(JSON.stringify({ exp: 1 }));
    expect(isTokenExpired(`h.${past}.s`)).toBe(true);
  });

  it("token com exp no futuro: não expirado", () => {
    const future = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    expect(isTokenExpired(`h.${future}.s`)).toBe(false);
  });
});
