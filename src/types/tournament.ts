// Tipos do modo torneio (espelham os DTOs do backend em quizapi/game).

export type TournamentStatus = "LOBBY" | "IN_PROGRESS" | "FINISHED";
export type MatchStatus = "PENDING" | "WAITING_PLAYERS" | "IN_PROGRESS" | "DONE" | "BYE";

export interface TournamentPlayerView {
  id: string;
  name: string;
  host: boolean;
  eliminated: boolean;
  title?: string | null;
  frame?: string | null;
  banner?: string | null;
}

export interface MatchView {
  id: string;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  roomCode: string | null;
  status: MatchStatus;
}

export interface TournamentState {
  code: string;
  hostId: string;
  name: string;
  themeId: number | null;
  themeName: string | null;
  status: TournamentStatus;
  players: TournamentPlayerView[];
  rounds: MatchView[][];
  championId: string | null;
}

export interface CreateTournamentRequest {
  hostId: string;
  hostName: string;
  name: string;
  themeId: number | null;
  questionCount: number;
  questionTimeSeconds: number;
  maxPlayers: number;
  /** UUID da conta real do host (para exibir cosméticos); vazio = convidado. */
  hostUuid: string;
}
