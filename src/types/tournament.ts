// Tipos do modo torneio (espelham os DTOs do backend em quizapi/game).

export type TournamentStatus = "LOBBY" | "CONFIGURING" | "IN_PROGRESS" | "FINISHED";
export type MatchStatus = "PENDING" | "WAITING_PLAYERS" | "IN_PROGRESS" | "DONE" | "BYE";

/** Quiz escolhido para uma rodada do chaveamento (themeId null = ainda não escolhido). */
export interface RoundThemeView {
  roundIndex: number;
  label: string;
  themeId: number | null;
  themeName: string | null;
}

export interface TournamentPlayerView {
  id: string;
  name: string;
  host: boolean;
  eliminated: boolean;
  title?: string | null;
  frame?: string | null;
  banner?: string | null;
  font?: string | null;
  nameStyle?: string | null;
  nameEffect?: string | null;
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
  /** Capacidade máxima configurada (4/8/16). */
  maxPlayers: number;
  /** Nº de jogadores fixado ao travar as chaves (0 no lobby). */
  bracketSize: number;
  /** Quiz de cada rodada (só após travar as chaves). */
  roundThemes: RoundThemeView[];
}

/** Evento empurrado pelo backend no tópico STOMP do torneio. */
export type TournamentEvent =
  | { type: "STATE"; data: TournamentState }
  | { type: "CLOSED" };

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
