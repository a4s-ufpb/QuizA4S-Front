import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResultsView from "./ResultsView";
import type { UseGameRoom } from "../../hooks/useGameRoom";

// Efeitos colaterais e dependências externas neutralizados.
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));
vi.mock("../../util/shareImage", () => ({ generateResultImage: () => "", downloadImage: vi.fn() }));
vi.mock("../../util/matchHistory", () => ({ addMatchHistoryEntry: vi.fn() }));
vi.mock("../../util/storage", () => ({ getStoredUser: () => ({ uuid: "" }) }));
vi.mock("../../query/useMatchHistoryQueries", () => ({ useRecordMatchMutation: () => ({ mutate: vi.fn() }) }));
vi.mock("../../query/useUserQueries", () => ({ useLikeUserMutation: () => ({ mutate: vi.fn() }) }));

function makeRoom(hostPlays: boolean): UseGameRoom {
  const state = {
    code: "ROOM1",
    themeName: "Quiz",
    totalQuestions: 5,
    config: { roomMode: "INDIVIDUAL", hostPlays },
    teams: [],
    players: [
      // Líder que jogou e VENCEU (maior pontuação).
      { id: "host", name: "Organizador", host: true, score: 900, correctCount: 4, teamId: null, eliminated: false },
      { id: "p2", name: "Segundo", host: false, score: 500, correctCount: 2, teamId: null, eliminated: false },
    ],
  };
  // Só os campos usados pelo ResultsView; o restante da interface é irrelevante aqui.
  return { state, playerId: "host" } as unknown as UseGameRoom;
}

describe("ResultsView (torneio: líder joga)", () => {
  it("inclui o líder vencedor no pódio quando hostPlays", () => {
    render(
      <MemoryRouter>
        <ResultsView room={makeRoom(true)} tournamentCode="TCODE" />
      </MemoryRouter>
    );
    // O líder vencedor deve aparecer (antes da correção era filtrado e o 2º
    // colocado surgia como campeão da chave).
    expect(screen.getByText(/Organizador/)).toBeInTheDocument();
    // Em contexto de torneio, o botão volta ao torneio.
    expect(screen.getByRole("button", { name: /Voltar ao torneio/i })).toBeInTheDocument();
  });

  it("oculta o líder espectador quando NÃO joga (sala normal)", () => {
    render(
      <MemoryRouter>
        <ResultsView room={makeRoom(false)} />
      </MemoryRouter>
    );
    expect(screen.queryByText(/Organizador/)).not.toBeInTheDocument();
    expect(screen.getByText(/Segundo/)).toBeInTheDocument();
  });
});
