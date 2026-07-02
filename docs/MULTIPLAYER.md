# Modo Multiplayer (Kahoot-style) — Frontend

Interface do quiz multiplayer em tempo real. Não exige login (jogadores são
convidados) e não persiste respostas. Consome o motor em memória do backend via
STOMP/SockJS. Protocolo completo em `../QuizAPI/docs/MULTIPLAYER.md`.

## Arquivos

```
src/
├── types/game.ts                       # tipos espelhando os DTOs do backend
├── util/guest.ts                       # identidade de convidado (id + nome)
├── service/GameService.ts              # REST: criar / buscar sala
├── service/GameSocket.ts               # wrapper STOMP + SockJS
├── hooks/useGameRoom.ts                # conexão + estado + ações da sala
├── routes/multiplayer/
│   ├── Multiplayer.tsx                 # entrada: nome + criar / entrar por código
│   └── Room.tsx                        # portão de nome → RoomConnected
└── components/multiplayer/
    ├── RoomConnected.tsx               # orquestra por status (lobby/jogo/fim)
    ├── Lobby.tsx                       # jogadores, pronto, equipes, controles do líder
    ├── RoomChat.tsx                    # chat em tempo real
    ├── RoomConfigForm.tsx              # modal de regras (líder)
    ├── GamePlay.tsx                    # questão + alternativas + timer + placar
    └── ResultsView.tsx                 # ranking final
```

Rotas (públicas, em `main.tsx`): `/multiplayer` e `/room/:code`. O footer é
ocultado em `/room` (`useFooter`). Há entrada "Multiplayer" no `Menu`.

## Identidade de convidado (`util/guest.ts`)

- `getGuestId()`: UUID estável por navegador (`localStorage`), enviado como
  `playerId` em toda ação.
- `getGuestName()/setGuestName()`: nome escolhido na tela de entrada.

## Conexão (`GameSocket` + `useGameRoom`)

- `GameSocket` cria um `Client` STOMP com `webSocketFactory: () => new SockJS(WS_URL)`
  (por isso `vite.config.ts` define `global: "globalThis"`, exigido pelo
  `sockjs-client`). Assina `/topic/room/{code}` e publica em `/app/game/{ação}`.
- `WS_URL` (em `vite-env.ts`) deriva de `API_URL` removendo `/v1` e somando `/ws`.
- `useGameRoom(code)` conecta no mount, envia `join` ao conectar, envia `leave`
  no unmount, e traduz os `GameEvent` recebidos em estado React:
  `state`, `question`, `result`, `messages`, `error`, `kicked`, `closed`.
  Expõe as ações: `setReady`, `pickTeam`, `kick`, `changeQuiz`, `updateConfig`,
  `sendChat`, `start`, `answer`, `next`, `leave`.

## Fluxo de telas (`RoomConnected` faz o switch por `state.status`)

1. **LOBBY** → `Lobby` + `RoomChat`. Jogador marca "pronto" e (modo equipe)
   escolhe equipe. O líder seleciona/troca o quiz (reusa `ThemeTemplate` num
   modal), edita as regras (`RoomConfigForm`), expulsa jogadores e inicia
   (habilitado quando há quiz e todos prontos).
2. **IN_QUESTION / BETWEEN** → `GamePlay`. Mostra a questão, alternativas
   coloridas (estilo Kahoot) e o cronômetro derivado de `question.startAt`.
   Ao responder, envia `answer` e trava a seleção. No `BETWEEN` destaca o
   gabarito e o placar; o líder avança (`next`) no modo `HOST`.
3. **FINISHED** → `ResultsView`: ranking de jogadores (e de equipes no modo
   TEAM).

Eventos especiais: `KICKED` (se for o próprio id → tela "removido"),
`ROOM_CLOSED` (host saiu → tela "sala encerrada"), `ERROR` (alerta no topo).

## Dependências adicionadas

`@stomp/stompjs`, `sockjs-client` (+ `@types/sockjs-client`).

## Testar localmente

1. Subir o backend (`QuizAPI`) — ajustar `API_URL`/`WS_URL` em `vite-env.ts`
   para o host local (ex.: `http://localhost:8080` sem o prefixo `/api`).
2. `npm run dev`, abrir `/multiplayer` em duas abas/navegadores.
3. Numa aba criar sala, copiar o código, entrar pela outra, marcar pronto,
   selecionar um quiz (tema com questões) e iniciar.
