import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_URL } from "../vite-env";
import type { GameEvent } from "../types/game";

/**
 * Wrapper fino sobre STOMP + SockJS para uma sala multiplayer.
 * Conecta em `/ws`, assina `/topic/room/{code}` e envia ações para `/app/game/*`.
 */
export class GameSocket {
  private client: Client | null = null;

  connect(
    code: string,
    onEvent: (event: GameEvent) => void,
    onReady?: () => void
  ): void {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 3000,
      // Sem heartbeat a queda de conexão só é percebida no próximo evento
      // esperado — com isso, ambos os lados detectam em ~5s e reconectam.
      heartbeatIncoming: 5000,
      heartbeatOutgoing: 5000,
      onConnect: () => {
        client.subscribe(`/topic/room/${code}`, (message: IMessage) => {
          try {
            onEvent(JSON.parse(message.body) as GameEvent);
          } catch {
            // ignora payloads malformados
          }
        });
        onReady?.();
      },
    });
    client.activate();
    this.client = client;
  }

  /** Envia uma ação para `/app/game/{action}`. */
  send(action: string, body: unknown): void {
    if (!this.client || !this.client.connected) return;
    this.client.publish({
      destination: `/app/game/${action}`,
      body: JSON.stringify(body),
    });
  }

  disconnect(): void {
    this.client?.deactivate();
    this.client = null;
  }
}
