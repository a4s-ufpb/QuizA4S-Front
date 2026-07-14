import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { GameEvent } from "../types/game";

// Captura o callback de eventos que o hook registra no socket, permitindo
// injetar eventos STOMP simulados sem uma conexão real.
let emit: ((event: GameEvent) => void) | undefined;

vi.mock("../service/GameSocket", () => ({
  GameSocket: class {
    connect(_code: string, onEvent: (e: GameEvent) => void, onReady?: () => void) {
      emit = onEvent;
      onReady?.();
    }
    send() {}
    disconnect() {}
  },
}));

import { useGameRoom } from "./useGameRoom";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function send(event: GameEvent) {
  act(() => {
    emit?.(event);
  });
}

describe("useGameRoom", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    sessionStorage.setItem("mp_guest_id", "me"); // playerId fixo
    emit = undefined;
  });

  it("conecta e processa evento STATE", async () => {
    const { result } = renderHook(() => useGameRoom("ABC123"), { wrapper });

    await waitFor(() => expect(emit).toBeDefined());

    send({ type: "STATE", data: { status: "LOBBY", players: [] } } as GameEvent);

    expect(result.current.state?.status).toBe("LOBBY");
  });

  it("ignora ERROR direcionado a outro jogador", async () => {
    const { result } = renderHook(() => useGameRoom("ABC123"), { wrapper });
    await waitFor(() => expect(emit).toBeDefined());

    send({
      type: "ERROR",
      data: { message: "A partida já começou.", targetPlayerId: "outro" },
    } as GameEvent);

    expect(result.current.error).toBe("");
  });

  it("exibe ERROR direcionado a mim", async () => {
    const { result } = renderHook(() => useGameRoom("ABC123"), { wrapper });
    await waitFor(() => expect(emit).toBeDefined());

    send({
      type: "ERROR",
      data: { message: "A sala está cheia.", targetPlayerId: "me" },
    } as GameEvent);

    expect(result.current.error).toBe("A sala está cheia.");
  });

  it("exibe ERROR global (string simples)", async () => {
    const { result } = renderHook(() => useGameRoom("ABC123"), { wrapper });
    await waitFor(() => expect(emit).toBeDefined());

    send({ type: "ERROR", data: "Falha genérica" } as GameEvent);

    expect(result.current.error).toBe("Falha genérica");
  });

  it("QUESTION define a questão atual e limpa o resultado anterior", async () => {
    const { result } = renderHook(() => useGameRoom("ABC123"), { wrapper });
    await waitFor(() => expect(emit).toBeDefined());

    send({ type: "QUESTION", data: { id: 1, index: 0, title: "Q1" } } as GameEvent);

    expect(result.current.question?.title).toBe("Q1");
    expect(result.current.result).toBeNull();
  });
});
