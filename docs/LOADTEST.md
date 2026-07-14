# Teste de carga — modo multiplayer

O front não precisa estar rodando: o teste simula o comportamento do navegador
no nível do protocolo. O cliente de carga (`loadtest/loadtest.js` neste repo)
usa **STOMP sobre WebSocket** no endpoint SockJS `/ws/websocket` — exatamente o
que `src/service/GameSocket.ts` faz — e reproduz o fluxo real de uma partida:

1. cria a sala via `POST /v1/game/room` (como a tela Multiplayer)
2. host + N jogadores enviam `join`, jogadores enviam `ready`
3. host envia `start`; a cada evento `QUESTION` os jogadores respondem com
   atraso aleatório de 0,3–2,5 s (como alunos reais)
4. a cada `RESULT` o host envia `next` até a partida terminar

## Arquivos

| Arquivo | Função |
|---|---|
| `loadtest/loadtest.js` | Cliente de carga (Node 18+, `fetch` nativo) |
| `loadtest/run-scenario.ps1` | Roda um cenário e amostra CPU/RAM do container da API |
| `loadtest/package.json` | Dependências: `@stomp/stompjs` e `ws` |

O servidor sob teste sobe pelo repo **QuizAPI** com o override
`compose.loadtest.yaml`, que limita a API a 2 vCPUs / 2,5 GB — veja o passo a
passo completo em `QuizAPI/docs/LOADTEST.md`.

## Uso rápido

```powershell
# API já de pé e banco populado (QuizAPI: compose + seed.ps1)
cd loadtest
npm install
./run-scenario.ps1 -Rooms 10 -Players 12 -Questions 6
# ou, sem amostrar o container:
node loadtest.js --rooms 10 --players 12 --questions 6 --url http://localhost:8080
```

Acima de 12 jogadores por sala o script loga como o admin do seed
(`admin@quizapp.com` / `Admin@123`), que pode criar salas de até 48.

## Métricas

- **join→STATE**: `join` enviado → primeiro estado da sala recebido
- **entrega QUESTION**: `startAt` do servidor → questão recebida no cliente
  (latência real de broadcast)
- **answer→RESULT**: inclui a espera pelos colegas mais lentos (~1 s esperado)
- **desconexões/erros** e **pico de CPU/RAM** do container

Resultados de referência e conclusões: `QuizAPI/docs/LOADTEST.md`.
