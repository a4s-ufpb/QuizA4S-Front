import { useCallback, useEffect, useRef, useState } from "react";
import { GameSocket } from "../service/GameSocket";
import { getGuestId, getGuestName } from "../util/guest";
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
  clearError: () => void;
  setReady: (ready: boolean) => void;
  pickTeam: (teamId: string) => void;
  kick: (targetId: string) => void;
  changeQuiz: (themeId: number) => void;
  updateConfig: (config: GameConfig) => void;
  sendChat: (content: string) => void;
  start: () => void;
  answer: (alternativeId: number) => void;
  next: () => void;
  leave: () => void;
}

/** Gerencia a conexão STOMP e o estado de uma sala multiplayer. */
export function useGameRoom(code: string): UseGameRoom {
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

  const handleEvent = useCallback(
    (event: GameEvent) => {
      switch (event.type) {
        case "STATE": {
          const next = event.data as RoomState;
          setState(next);
          if (next.status === "LOBBY" || next.status === "FINISHED") {
            setQuestion(null);
          }
          if (next.status === "LOBBY") setResult(null);
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
      }
    },
    [playerId]
  );

  useEffect(() => {
    const socket = new GameSocket();
    socketRef.current = socket;
    socket.connect(code, handleEvent, () => {
      setConnected(true);
      socket.send("join", { code, playerId, name: getGuestName() });
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
    clearError: () => setError(""),
    setReady: (ready) => send("ready", { code, playerId, ready }),
    pickTeam: (teamId) => send("team", { code, playerId, teamId }),
    kick: (targetId) => send("kick", { code, hostId: playerId, targetId }),
    changeQuiz: (themeId) => send("change-quiz", { code, hostId: playerId, themeId }),
    updateConfig: (config) => send("config", { code, hostId: playerId, config }),
    sendChat: (content) => send("chat", { code, playerId, content }),
    start: () => send("start", { code, hostId: playerId }),
    answer: (alternativeId) => send("answer", { code, playerId, alternativeId }),
    next: () => send("next", { code, hostId: playerId }),
    leave: () => send("leave", { code, playerId }),
  };
}
