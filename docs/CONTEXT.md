# QuizA4S-Front — Contexto do Projeto

Frontend do **Quiz A4S**, aplicação educativa de quizzes do projeto de extensão
**Apps4Society** (UFPB Campus IV — Rio Tinto). Consome a API `QuizAPI`
(Spring Boot). Ver o contexto do backend em `../QuizAPI/docs/CONTEXT.md`.

## Stack

| Camada        | Tecnologia                                   |
| ------------- | -------------------------------------------- |
| Linguagem     | TypeScript (strict)                          |
| UI            | React 18                                     |
| Build/dev     | Vite 8 (bundler rolldown)                    |
| Roteamento    | react-router-dom 6                           |
| HTTP          | axios (+ `fetch` no util `ApiFetch`)         |
| UI toolkit    | react-bootstrap 2 + bootstrap 5              |
| Ícones        | react-bootstrap-icons, react-icons          |
| Formulários   | react-hook-form + yup (`@hookform/resolvers`)|
| Lint/format   | ESLint 8 (+ `@typescript-eslint`) + Prettier |

Node 20.19+/22+ (Vite 8). Deploy via Docker + nginx (`Dockerfile`, `nginx.conf`).

## Scripts (`package.json`)

```
npm run dev        # servidor de desenvolvimento Vite
npm run build      # build de produção (vite build)
npm run typecheck  # tsc --noEmit (verificação de tipos, não bloqueia o build)
npm run lint       # eslint em ts,tsx
npm run format     # prettier --write em src
npm run preview    # serve o build (porta 80)
```

> `build` roda apenas `vite build` (esbuild/rolldown remove os tipos, não faz
> type-check). A verificação de tipos é o script `typecheck` separado — rode-o na
> CI para garantir a corretude.

## Estrutura de pastas

```
src/
├── main.tsx                 # entrypoint: ReactDOM + BrowserRouter + rotas
├── App.tsx                  # layout raiz (Header, <Outlet/>, Footer, Loading)
├── vite-env.ts              # CONSTANTES da app (API_URL, DEFAULT_IMG, Pexels, pontuação)
├── vite-client.d.ts         # /// <reference types="vite/client" /> (tipos de assets)
├── index.css / App.css
├── assets/                  # imagens .webp, sons .mp3
├── types/
│   └── index.ts             # modelos de domínio + tipos de API compartilhados
├── axios/
│   └── AxiosConfig.ts        # instância axios (baseURL, interceptor de token)
├── util/
│   ├── ApiFetch.ts          # helper de listagem paginada via fetch (getPages<T>)
│   └── storage.ts           # getStoredUser() / getStoredTheme() (localStorage tipado)
├── service/                 # uma classe por recurso da API
│   ├── BaseService.ts       # handleRequest<T> genérico (base de todos os serviços)
│   ├── UserService.ts, ThemeService.ts, QuestionService.ts,
│   ├── AlternativeService.ts, ResponseService.ts, ScoreService.ts,
│   ├── StatisticService.ts, RoomService.ts, SearchImageService.ts
├── context/
│   └── AuthenticationContext.tsx   # provider de autenticação (isAuthenticated, loading)
├── hooks/
│   └── useFooter.tsx        # esconde o footer em rotas de /quiz e /room
├── components/              # componentes reutilizáveis (1 pasta por componente + .css)
│   ├── header/, footer/, menu/, loading/, notFound/, pagination/
│   ├── confirmBox/, informationBox/, updateBox/, feedbackBox/
│   ├── formTemplate/, themeTemplate/, userTemplate/
│   ├── theme/, question/, questionBoxComponent/, questionListComponent/
│   ├── ranking/, quizFinished/, searchComponent/, searchImageComponent/
│   ├── filterComponent/, filterStatistic/, privateRoute/
└── routes/                  # páginas (mapeadas em main.tsx)
    ├── home/, user/ (Login, Register), chooseTheme/, quiz/
    ├── createQuiz/ (CreateQuiz, SelectTheme, CreateQuestions)
    ├── myquestion/ (MyQuestion, MyAlternative), rankingPage/, erroPage/
    └── profile/ (Profile + myTheme, myResponse, myStatisticPerResponse,
                  myStatisticPerConclusion, users)
```

## Rotas (`main.tsx`)

Todas aninhadas sob `App` (Header + Outlet + Footer). Rotas privadas envolvidas
em `<PrivateRoute>`.

| Path                              | Página          | Privada |
| --------------------------------- | --------------- | ------- |
| `/`                               | Home            | não     |
| `/login`, `/register`             | Login/Register  | não     |
| `/theme`                          | ChooseTheme     | não     |
| `/theme/quiz/:id`                 | Quiz            | não     |
| `/create/quiz`                    | CreateQuiz      | sim     |
| `/create/quiz/theme`              | SelectTheme     | sim     |
| `/create/quiz/:id/question`       | CreateQuestions | sim     |
| `/profile`                        | Profile         | sim     |
| `/profile/theme/:id/question`     | MyQuestion      | sim     |
| `/ranking`                        | RankingPage     | sim     |
| `*`                               | ErrorPage       | —       |

## Padrões do projeto

### Serviços (camada de API)

- Cada recurso tem uma classe em `src/service/` que **estende `BaseService`**.
- `BaseService.handleRequest<T>(method, url, data?)` envolve o axios e sempre
  retorna o envelope **`ApiResult<T> = { data, message, success }`**. Nunca lança —
  em erro, `success:false` e `message` vem de `error.response.data.message`.
- Instanciar com `new XService()` dentro do componente (sem DI/singleton).
- Endpoints são relativos a `API_URL` (`vite-env.ts`). O interceptor em
  `AxiosConfig.ts` injeta `Authorization: Bearer <token>` do localStorage.
- Listagens paginadas que não precisam de axios usam `ApiFetch.getPages<T>()`
  (retorna `ApiFetchResult<T> = { data, totalPages, success, message }`).

### Tipos

- Modelos de domínio e envelopes centralizados em **`src/types/index.ts`**
  (`User`, `Theme`, `Question`, `Alternative`, `Score`, `Statistic`,
  `ApiResult<T>`, `Page<T>`, `ApiFetchResult<T>`, `PexelsSearchResult`…).
- Backend usa paginação estilo Spring Data: `Page<T> = { content, totalPages }`.
- Importar tipos com `import type { ... }`.

### Componentes

- Um componente por pasta, com seu `.css` ao lado. Nomes em PascalCase.
- Props tipadas por uma `interface XProps` local. `Dispatch<SetStateAction<T>>`
  para setters passados como prop.
- Estado com `useState<T>()` tipado. `react-bootstrap` para UI (Modal, Form, etc.).
- Modais padrão reutilizáveis: `ConfirmBox`, `InformationBox`, `UpdateBox`,
  `Loading`, `NotFoundComponent`.

### Autenticação

- Token JWT em `localStorage.token`; dados do usuário em `localStorage.user`.
- `AuthenticationContext` valida o token no mount (`UserService.findUser()`) e
  expõe `{ isAuthenticated, setAuthenticated, loading }`.
- `PrivateRoute` renderiza `<Login/>` quando não autenticado.
- Ler o usuário/tema persistidos **sempre** via `getStoredUser()` /
  `getStoredTheme()` (`util/storage.ts`), nunca `JSON.parse(localStorage...)` cru.

### Estilo de código

- Prettier: aspas duplas, `;`, `printWidth 80`, 2 espaços (`.prettierrc.json`).
- ESLint: `@typescript-eslint/recommended` + regras de React/hooks + `prettier`.
- Avisos de `react-hooks/exhaustive-deps` em effects "run-once" são tolerados
  (não quebram o lint).

## Conceitos de domínio

- **Theme** (tema): agrupa questões; é o que o usuário chama de "quiz". Listado
  em `/theme`. Cada quiz precisa de ≥5 questões para ser jogável.
- **Question**: título, imagem opcional, e 4 **Alternatives** (uma correta).
- **Quiz (jogo)**: em `/theme/quiz/:id`, joga 10 questões do tema. Pontuação
  calculada com `HIT_VALUE`/`REDUCE_VALUE` (tempo). Sons de acerto/erro.
- **Score/Ranking**: pontuação salva por tema (usuários logados).
- **Statistic**: estatísticas por questão e por conclusão (painel do criador).
- **Room** (multiplayer): salas de quiz em tempo real via WebSocket — ver seção.

## Multiplayer (WebSocket)

`RoomService.ts` cobre as chamadas REST de sala (create/delete/find) e as ações
que no backend viram mensagens STOMP. O backend expõe um endpoint STOMP em `/ws`
(SockJS), broadcast em `/topic/room/{roomId}`, e destinos de app em
`/app/*` (join, quit, select-quiz, start-quiz). Detalhes do protocolo e do fluxo
de jogo no contexto do backend.
