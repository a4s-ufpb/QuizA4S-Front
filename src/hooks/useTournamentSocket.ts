import { useEffect, useRef, useState } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_URL } from "../vite-env";
import { TournamentService } from "../service/TournamentService";
import type { TournamentEvent, TournamentState } from "../types/tournament";

const tournamentService = new TournamentService();

export interface UseTournamentSocket {
  state: TournamentState | null;
  loading: boolean;
  /** Torneio encerrado/removido (o backend enviou CLOSED, ou não foi encontrado). */
  closed: boolean;
}

/**
 * Estado do torneio via WebSocket (STOMP): busca o estado inicial uma única vez
 * por REST e, a partir daí, recebe as atualizações empurradas pelo servidor no
 * tópico `/topic/tournament/{code}` — sem polling (evita 429 e sobrecarga).
 */
export function useTournamentSocket(code: string): UseTournamentSocket {
  const [state, setState] = useState<TournamentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [closed, setClosed] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!code) return;
    let active = true;
    setLoading(true);
    setClosed(false);

    // Estado inicial (uma vez).
    tournamentService.getState(code).then((response) => {
      if (!active) return;
      if (response.success) setState(response.data);
      else setClosed(true);
      setLoading(false);
    });

    // Atualizações em tempo real.
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 3000,
      heartbeatIncoming: 5000,
      heartbeatOutgoing: 5000,
      onConnect: () => {
        client.subscribe(`/topic/tournament/${code}`, (message: IMessage) => {
          try {
            const event = JSON.parse(message.body) as TournamentEvent;
            if (event.type === "CLOSED") {
              setClosed(true);
            } else if (event.type === "STATE") {
              setState(event.data);
            }
          } catch {
            // ignora payloads malformados
          }
        });
      },
    });
    client.activate();
    clientRef.current = client;

    return () => {
      active = false;
      client.deactivate();
      clientRef.current = null;
    };
  }, [code]);

  return { state, loading, closed };
}
