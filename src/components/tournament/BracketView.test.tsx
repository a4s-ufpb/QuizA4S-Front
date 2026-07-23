import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import BracketView from "./BracketView";
import type { MatchView, TournamentPlayerView } from "../../types/tournament";

const PLAYERS: TournamentPlayerView[] = [
  { id: "me", name: "Eu", host: true, eliminated: false },
  { id: "rival", name: "Rival", host: false, eliminated: false },
];

function LocationEcho() {
  const location = useLocation();
  return <div>ROTA:{location.pathname}{location.search}</div>;
}

function renderBracket(rounds: MatchView[][], tournamentCode?: string) {
  return render(
    <MemoryRouter initialEntries={["/t"]}>
      <Routes>
        <Route
          path="/t"
          element={
            <BracketView rounds={rounds} players={PLAYERS} myPlayerId="me" tournamentCode={tournamentCode} />
          }
        />
        <Route path="/room/:code" element={<LocationEcho />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("BracketView", () => {
  it("mostra o rótulo da rodada final", () => {
    const rounds: MatchView[][] = [
      [{ id: "m1", player1Id: "me", player2Id: "rival", winnerId: null, roomCode: "R1", status: "IN_PROGRESS" }],
    ];
    renderBracket(rounds);
    expect(screen.getByText("Final")).toBeInTheDocument();
  });

  it("exibe 'Entrar na sua partida' no confronto do jogador e navega com ?tournament", async () => {
    const rounds: MatchView[][] = [
      [{ id: "m1", player1Id: "me", player2Id: "rival", winnerId: null, roomCode: "R1", status: "IN_PROGRESS" }],
    ];
    renderBracket(rounds, "TCODE");

    await userEvent.click(screen.getByText("Entrar na sua partida"));

    expect(screen.getByText("ROTA:/room/R1?tournament=TCODE")).toBeInTheDocument();
  });

  it("não mostra o botão de entrar quando o confronto já terminou", () => {
    const rounds: MatchView[][] = [
      [{ id: "m1", player1Id: "me", player2Id: "rival", winnerId: "me", roomCode: "R1", status: "DONE" }],
    ];
    renderBracket(rounds, "TCODE");
    expect(screen.queryByText("Entrar na sua partida")).not.toBeInTheDocument();
  });

  it("item 2: rotula a 1ª rodada de um bracket de 2 rodadas como Semifinal (via totalRounds)", () => {
    const rounds: MatchView[][] = [
      [{ id: "m1", player1Id: "me", player2Id: "rival", winnerId: null, roomCode: "R1", status: "WAITING_PLAYERS" }],
    ];
    render(
      <MemoryRouter>
        <BracketView rounds={rounds} players={PLAYERS} myPlayerId="me" totalRounds={2} />
      </MemoryRouter>
    );
    expect(screen.getByText("Semifinal")).toBeInTheDocument();
    expect(screen.queryByText("Final")).not.toBeInTheDocument();
  });

  it("item 1: exibe o nome do campeão ao lado do troféu", () => {
    const rounds: MatchView[][] = [
      [{ id: "m1", player1Id: "me", player2Id: "rival", winnerId: "me", roomCode: "R1", status: "DONE" }],
    ];
    render(
      <MemoryRouter>
        <BracketView rounds={rounds} players={PLAYERS} myPlayerId="me" totalRounds={1} championId="me" />
      </MemoryRouter>
    );
    expect(screen.getByText("Campeão")).toBeInTheDocument();
    // "Eu" aparece no confronto e também abaixo do troféu (nome do campeão).
    expect(screen.getAllByText("Eu").length).toBeGreaterThanOrEqual(2);
  });
});
