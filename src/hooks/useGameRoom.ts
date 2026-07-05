import { useCallback, useEffect, useRef, useState } from "react";
import { GameSocket } from "../service/GameSocket";
import { useInsertMultiplayerResponsesMutation } from "../query/useResponseQueries";
import { getGuestId, getGuestName } from "../util/guest";
import { getStoredUser } from "../util/storage";
import type {
  ChatMessage,
  GameConfig,
  GameEvent,
  QuestionResult,
  QuestionView,
  RoomState,
} from "../types/game";

export interface UseGameRoom {
  playerId: string;
  connected: boolean;
  state: RoomState | null;
  question: QuestionView | null;
  result: QuestionResult | null;
  messages: ChatMessage[];
  error: string;
  kicked: boolean;
  closed: boolean;
  isHost: boolean;
  /** Contagem regressiva (segundos) antes da 1ª questão da partida, sincronizada com o servidor. */
  countdown: number | null;
  clearError: () => void;
  setReady: (ready: boolean) => void;
  pickTeam: (teamId: string) => void;
  createTeam: (teamName: string) => void;
  setAvatar: (avatar: string) => void;
  setTeamAvatar: (teamId: string, avatar: string) => void;
  transferCaptain: (teamId: string, newCaptainId: string) => void;
  kick: (targetId: string) => void;
  changeQuiz: (themeId: number) => void;
  updateConfig: (config: GameConfig) => void;
  setPower: (power: string | null) => void;
  sendChat: (content: string) => void;
  start: () => void;
  answer: (alternativeId: number) => void;
  next: () => void;
  leave: () => void;
}

/** Gerencia a conexão STOMP e o estado de uma sala multiplayer. */
export function useGameRoom(code: string, joinAvatar?: string): UseGameRoom {
  const socketRef = useRef<GameSocket | null>(null);
  const playerId = getGuestId();

  const [connected, setConnected] = useState(false);
  const [state, setState] = useState<RoomState | null>(null);
  const [question, setQuestion] = useState<QuestionView | null>(null);
  const [result, setResult] = useState<QuestionResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [kicked, setKicked] = useState(false);
  const [closed, setClosed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const insertMultiplayerResponsesMutation = useInsertMultiplayerResponsesMutation();

  // Buffer local das respostas do usuário logado no modo todos-contra-todos:
  // são salvas em uma única request ao final da partida (evita 1 request por
  // questão, melhor performance para o servidor e para a rede do jogador).
  const answersBufferRef = useRef<{ questionId: number; alternativeId: number }[]>([]);
  const answersSubmittedRef = useRef(false);

  const handleEvent = useCallback(
    (event: GameEvent) => {
      switch (event.type) {
        case "STATE": {
          const next = event.data as RoomState;
          // Evita re-render de quem consome `state` (ex: a tela de pergunta)
          // quando o broadcast não mudou nada de fato — o servidor manda
          // STATE completo a cada ação de qualquer jogador (chat, ready,
          // etc.), mesmo sem mudança relevante pra quem só olha a questão.
          setState((prev) =>
            prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next
          );
          if (next.status === "LOBBY" || next.status === "FINISHED") {
            setQuestion(null);
          }
          if (next.status === "LOBBY") {
            setResult(null);
            answersBufferRef.current = [];
            answersSubmittedRef.current = false;
          }
          if (next.status === "IN_QUESTION") setCountdown(null);
          if (
            next.status === "FINISHED" &&
            next.config.roomMode === "INDIVIDUAL" &&
            !answersSubmittedRef.current &&
            answersBufferRef.current.length > 0 &&
            getStoredUser().uuid
          ) {
            answersSubmittedRef.current = true;
            insertMultiplayerResponsesMutation.mutate(answersBufferRef.current);
          }
          break;
        }
        case "QUESTION":
          setResult(null);
          setQuestion(event.data as QuestionView);
          break;
        case "RESULT":
          setResult(event.data as QuestionResult);
          break;
        case "CHAT":
          setMessages((prev) => [...prev, event.data as ChatMessage]);
          break;
        case "KICKED":
          if (event.data === playerId) setKicked(true);
          break;
        case "ROOM_CLOSED":
          setClosed(true);
          break;
        case "ERROR":
          setError(String(event.data));
          break;
        case "COUNTDOWN":
          setCountdown(event.data as number);
          break;
      }
    },
    [playerId, insertMultiplayerResponsesMutation]
  );

  // Decrementa a contagem regressiva localmente, 1 segundo por vez, até sumir.
  useEffect(() => {
    if (countdown == null) return;
    if (countdown <= 0) {
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    const socket = new GameSocket();
    socketRef.current = socket;
    socket.connect(code, handleEvent, () => {
      setConnected(true);
      socket.send("join", {
        code,
        playerId,
        name: getGuestName(),
        avatar: joinAvatar,
        userUuid: getStoredUser().uuid || undefined,
      });
    });
    return () => {
      socket.send("leave", { code, playerId });
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const send = useCallback((action: string, body: unknown) => {
    socketRef.current?.send(action, body);
  }, []);

  const isHost = state?.hostId === playerId;

  return {
    playerId,
    connected,
    state,
    question,
    result,
    messages,
    error,
    kicked,
    closed,
    isHost,
    countdown,
    clearError: () => setError(""),
    setReady: (ready) => send("ready", { code, playerId, ready }),
    pickTeam: (teamId) => send("team", { code, playerId, teamId }),
    createTeam: (teamName) =>
      send("team/create", { code, playerId, teamName }),
    setAvatar: (avatar) => send("avatar", { code, playerId, avatar }),
    setTeamAvatar: (teamId, avatar) =>
      send("team/avatar", { code, playerId, teamId, avatar }),
    transferCaptain: (teamId, newCaptainId) =>
      send("team/captain", { code, playerId, teamId, newCaptainId }),
    kick: (targetId) => send("kick", { code, hostId: playerId, targetId }),
    changeQuiz: (themeId) => send("change-quiz", { code, hostId: playerId, themeId }),
    updateConfig: (config) => send("config", { code, hostId: playerId, config }),
    setPower: (power) => send("power", { code, hostId: playerId, power }),
    sendChat: (content) => send("chat", { code, playerId, content }),
    start: () => send("start", { code, hostId: playerId }),
    answer: (alternativeId) => {
      if (
        question &&
        state?.config.roomMode === "INDIVIDUAL" &&
        getStoredUser().uuid
      ) {
        answersBufferRef.current.push({
          questionId: question.id,
          alternativeId,
        });
      }
      send("answer", { code, playerId, alternativeId });
    },
    next: () => send("next", { code, hostId: playerId }),
    leave: () => send("leave", { code, playerId }),
  };
}
