// Tipos do modo multiplayer (espelham os DTOs do backend em quizapi/game).

export type RoomMode = "INDIVIDUAL" | "TEAM";
export type ScoringMode = "SPEED" | "FIXED";
export type AdvanceMode = "HOST" | "AUTO";
export type RoomStatus = "LOBBY" | "IN_QUESTION" | "BETWEEN" | "FINISHED";

export interface GameConfig {
  roomMode: RoomMode;
  scoringMode: ScoringMode;
  advanceMode: AdvanceMode;
  questionTimeSeconds: number;
  questionCount: number;
  maxPlayersPerTeam?: number | null;
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
}

export interface TeamView {
  id: string;
  name: string;
  score: number;
  avatar?: string | null;
  captainId: string | null;
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
}

export interface AlternativeView {
  id: number;
  text: string;
}

export interface QuestionView {
  id: number;
  title: string;
  imageUrl: string;
  imageBase64One?: string;
  imageBase64Two?: string;
  imagesOrder?: string;
  index: number;
  total: number;
  timeSeconds: number;
  startAt: number;
  alternatives: AlternativeView[];
}

export interface PlayerAnswerView {
  playerId: string;
  playerName: string;
  answered: boolean;
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
  questionTimeSeconds: 20,
  questionCount: 10,
  maxPlayersPerTeam: null,
};
