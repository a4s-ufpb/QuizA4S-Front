// Tipos do modo multiplayer (espelham os DTOs do backend em quizapi/game).

export type RoomMode = "INDIVIDUAL" | "TEAM";
export type ScoringMode = "SPEED" | "FIXED";
export type AdvanceMode = "HOST" | "AUTO";
export type RoomStatus = "LOBBY" | "IN_QUESTION" | "BETWEEN" | "FINISHED";
export type GameStyle = "NORMAL" | "FUN" | "SURVIVAL" | "LIGHTNING";

export const GAME_STYLE_LABELS: Record<GameStyle, string> = {
  NORMAL: "Normal",
  FUN: "Diversão (poderes)",
  SURVIVAL: "Sobrevivência (quem erra é eliminado)",
  LIGHTNING: "Relâmpago (tempo decrescente)",
};

export type QuestionPower =
  | "SCORE_1_5X"
  | "SCORE_2_0X"
  | "SCORE_2_5X"
  | "HIDE_WRONG_ALTERNATIVE"
  | "HIDE_ALTERNATIVE_TEXTS"
  | "BLINK_SCREEN"
  | "SHAKE_SCREEN"
  | "STEAL_POINTS";

export interface GameConfig {
  roomMode: RoomMode;
  scoringMode: ScoringMode;
  advanceMode: AdvanceMode;
  questionTimeSeconds: number;
  questionCount: number;
  maxPlayersPerTeam?: number | null;
  gameStyle: GameStyle;
  /** Capacidade máxima da sala (não conta o host). */
  maxPlayers?: number | null;
}

export interface PlayerView {
  id: string;
  name: string;
  host: boolean;
  ready: boolean;
  teamId: string | null;
  score: number;
  avatar?: string | null;
  captain: boolean;
  /** UUID da conta real do jogador, se estiver logado (null = convidado). */
  userUuid: string | null;
  /** Modo Sobrevivência: errou (ou não respondeu) — virou espectador pro resto da partida. */
  eliminated: boolean;
  /** Cosméticos equipados (só jogadores logados) — códigos da loja, null = nenhum. */
  title?: string | null;
  frame?: string | null;
  banner?: string | null;
  /** Nº de questões acertadas na partida (base de XP/moedas/histórico). */
  correctCount: number;
}

export interface TeamView {
  id: string;
  name: string;
  score: number;
  avatar?: string | null;
  captainId: string | null;
}

/** Prévia da próxima questão (só o líder exibe, entre questões). */
export interface NextQuestionPreview {
  id: number;
  title: string;
  imageUrl?: string;
  imageOneUrl?: string;
  imageTwoUrl?: string;
  imagesOrder?: string;
  alternatives: AlternativeView[];
}

export interface RoomState {
  code: string;
  hostId: string;
  themeId: number | null;
  themeName: string | null;
  themeImageUrl: string | null;
  config: GameConfig;
  status: RoomStatus;
  players: PlayerView[];
  teams: TeamView[];
  currentQuestionIndex: number;
  totalQuestions: number;
  /** Poder armado (modo Diversão) pra próxima questão — só o líder escolhe. */
  pendingPowerUp: QuestionPower | null;
  /** Prévia da próxima questão (BETWEEN, só quando há próxima) — só o líder usa. */
  nextQuestion: NextQuestionPreview | null;
  /** Quantas questões o líder pulou desde o último resultado (aviso aos jogadores). */
  skippedCount: number;
}

export interface AlternativeView {
  id: number;
  text: string;
}

// Imagens já vêm como URLs do MinIO (leves), sem precisar de fetch sob demanda.
export interface QuestionView {
  id: number;
  title: string;
  imageUrl: string;
  imageOneUrl?: string;
  imageTwoUrl?: string;
  imagesOrder?: string;
  index: number;
  total: number;
  timeSeconds: number;
  startAt: number;
  alternatives: AlternativeView[];
  /** Poder valendo pra essa questão (modo Diversão), ou null no modo Normal. */
  activePower: QuestionPower | null;
}

export interface PlayerAnswerView {
  playerId: string;
  playerName: string;
  answered: boolean;
  correct: boolean;
}

/** Quantos jogadores marcaram cada alternativa (gráfico estilo Kahoot pós-questão). */
export interface AlternativeCountView {
  id: number;
  text: string;
  count: number;
  correct: boolean;
}

export interface QuestionResult {
  correctAlternativeId: number | null;
  index: number;
  total: number;
  lastQuestion: boolean;
  scoreboard: PlayerView[];
  teamScoreboard: TeamView[];
  answers: PlayerAnswerView[];
  /** Distribuição de respostas por alternativa, na mesma ordem do QuestionView. */
  alternatives: AlternativeCountView[];
  /** Título da próxima questão (null na última) — o líder vê no placar pra decidir pular. */
  nextQuestionTitle: string | null;
}

/** Erro direcionado a um jogador específico (o tópico STOMP é da sala inteira). */
export interface TargetedError {
  message: string;
  targetPlayerId: string | null;
}

export interface ChatMessage {
  playerId: string;
  name: string;
  content: string;
  timestamp: number;
}

export type GameEventType =
  | "STATE"
  | "QUESTION"
  | "RESULT"
  | "CHAT"
  | "KICKED"
  | "ROOM_CLOSED"
  | "ERROR"
  | "COUNTDOWN";

export interface GameEvent {
  type: GameEventType;
  data: unknown;
}

export interface CreateRoomRequest {
  hostId: string;
  hostName: string;
  themeId?: number | null;
  config?: GameConfig | null;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  roomMode: "INDIVIDUAL",
  scoringMode: "SPEED",
  advanceMode: "HOST",
  questionTimeSeconds: 120,
  questionCount: 10,
  maxPlayersPerTeam: null,
  gameStyle: "NORMAL",
  maxPlayers: 12,
};

export const QUESTION_POWER_LABELS: Record<QuestionPower, string> = {
  SCORE_1_5X: "Questão vale 1.5x",
  SCORE_2_0X: "Questão vale 2.0x",
  SCORE_2_5X: "Questão vale 2.5x",
  HIDE_WRONG_ALTERNATIVE: "Esconder uma alternativa errada",
  HIDE_ALTERNATIVE_TEXTS: "Esconder o texto das alternativas",
  BLINK_SCREEN: "Piscar a tela",
  SHAKE_SCREEN: "Tremer a tela",
  STEAL_POINTS: "Roubar 100 pontos (primeiro a acertar)",
};
