import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import TournamentRoom from "./TournamentRoom";
import type { TournamentState } from "../../types/tournament";

const HOST_ID = "host-1";

// Host é o usuário atual.
vi.mock("../../util/guest", () => ({
  getGuestId: () => HOST_ID,
  getGuestName: () => "",
  setGuestName: () => {},
}));

// Estado do torneio controlado por teste; mutações no-op.
let currentState: TournamentState;
vi.mock("../../hooks/useTournamentSocket", () => ({
  useTournamentSocket: () => ({ state: currentState, loading: false, closed: false }),
}));
vi.mock("../../query/useTournamentQueries", () => ({
  useStartTournamentMutation: () => ({ mutateAsync: vi.fn().mockResolvedValue({ success: true }) }),
  useConfigureTournamentMutation: () => ({ mutateAsync: vi.fn().mockResolvedValue({ success: true }) }),
  useReopenTournamentMutation: () => ({ mutateAsync: vi.fn().mockResolvedValue({ success: true }) }),
  useSetRoundThemeMutation: () => ({ mutateAsync: vi.fn().mockResolvedValue({ success: true }) }),
  useKickTournamentPlayerMutation: () => ({ mutateAsync: vi.fn().mockResolvedValue({ success: true }) }),
  useLeaveTournamentMutation: () => ({ mutateAsync: vi.fn().mockResolvedValue({ success: true }) }),
  useJoinTournamentMutation: () => ({ mutateAsync: vi.fn().mockResolvedValue({ success: true }) }),
}));

function baseState(overrides: Partial<TournamentState>): TournamentState {
  return {
    code: "ABC123",
    hostId: HOST_ID,
    name: "Torneio",
    themeId: null,
    themeName: null,
    status: "CONFIGURING",
    players: [{ id: HOST_ID, name: "Host", host: true, eliminated: false }],
    rounds: [],
    championId: null,
    maxPlayers: 8,
    bracketSize: 4,
    roundThemes: [],
    ...overrides,
  };
}

function renderRoom() {
  return render(
    <MemoryRouter initialEntries={["/tournament/ABC123"]}>
      <Routes>
        <Route path="/tournament/:code" element={<TournamentRoom />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("TournamentRoom (configuração)", () => {
  it("desabilita 'Iniciar torneio' enquanto houver rodada sem quiz", () => {
    currentState = baseState({
      roundThemes: [
        { roundIndex: 0, label: "Semifinal", themeId: 5, themeName: "Geografia" },
        { roundIndex: 1, label: "Final", themeId: null, themeName: null },
      ],
    });
    renderRoom();

    expect(screen.getByRole("button", { name: "Iniciar torneio" })).toBeDisabled();
    expect(screen.getByText("Quiz não escolhido")).toBeInTheDocument();
  });

  it("habilita 'Iniciar torneio' quando todas as rodadas têm quiz", () => {
    currentState = baseState({
      roundThemes: [
        { roundIndex: 0, label: "Semifinal", themeId: 5, themeName: "Geografia" },
        { roundIndex: 1, label: "Final", themeId: 6, themeName: "História" },
      ],
    });
    renderRoom();

    expect(screen.getByRole("button", { name: "Iniciar torneio" })).toBeEnabled();
  });

  it("no lobby, avisa quando o número de jogadores não é 4/8/16", () => {
    currentState = baseState({
      status: "LOBBY",
      bracketSize: 0,
      players: [
        { id: HOST_ID, name: "Host", host: true, eliminated: false },
        { id: "p1", name: "P1", host: false, eliminated: false },
        { id: "p2", name: "P2", host: false, eliminated: false },
      ],
    });
    renderRoom();

    expect(
      screen.getByText(/precisa ter exatamente 4, 8 ou 16 jogadores/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Travar chaves e escolher quizzes/i })
    ).toBeDisabled();
  });

  it("item 4/6: header traz label 'Código:', contador de jogadores e encerrar", () => {
    currentState = baseState({
      status: "LOBBY",
      bracketSize: 0,
      players: [
        { id: HOST_ID, name: "Host", host: true, eliminated: false },
        { id: "p1", name: "Ana", host: false, eliminated: false },
      ],
    });
    renderRoom();

    expect(screen.getByText("Código:")).toBeInTheDocument();
    expect(screen.getByText("jogadores no torneio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Encerrar torneio/i })).toBeInTheDocument();
  });

  it("item 1: remover um jogador pede confirmação", async () => {
    currentState = baseState({
      status: "LOBBY",
      bracketSize: 0,
      players: [
        { id: HOST_ID, name: "Host", host: true, eliminated: false },
        { id: "p1", name: "Ana", host: false, eliminated: false },
      ],
    });
    renderRoom();

    await userEvent.click(screen.getByRole("button", { name: "Remover Ana" }));

    expect(screen.getByText("Remover Ana do torneio?")).toBeInTheDocument();
  });

  it("item 5: visitante fora do torneio vê o formulário de entrada", () => {
    currentState = baseState({
      status: "LOBBY",
      bracketSize: 0,
      players: [{ id: "outro", name: "Outro", host: true, eliminated: false }],
    });
    renderRoom();

    expect(screen.getByRole("button", { name: "Entrar no torneio" })).toBeInTheDocument();
    expect(screen.getByLabelText("Seu nome")).toBeInTheDocument();
  });

  it("item 7: jogador eliminado vê aviso de espectador", () => {
    currentState = baseState({
      status: "IN_PROGRESS",
      bracketSize: 4,
      players: [
        { id: HOST_ID, name: "Host", host: true, eliminated: true },
        { id: "p1", name: "Ana", host: false, eliminated: false },
      ],
      rounds: [
        [{ id: "m", player1Id: HOST_ID, player2Id: "p1", winnerId: "p1", roomCode: "R1", status: "DONE" }],
      ],
      roundThemes: [{ roundIndex: 0, label: "Final", themeId: 1, themeName: "X" }],
    });
    renderRoom();

    expect(screen.getByText(/Você foi eliminado/i)).toBeInTheDocument();
  });
});
