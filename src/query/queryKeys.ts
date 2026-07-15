/**
 * Registro central das chaves de cache do React Query.
 *
 * Cada recurso expõe uma chave `all` (usada pra invalidar todo o cache
 * daquele recurso após uma escrita) e chaves mais específicas por parâmetro
 * de busca. Sempre que um service ganhar um novo método de GET, adicione a
 * chave correspondente aqui em vez de espalhar arrays soltos pelos hooks.
 */
export const queryKeys = {
  themes: {
    all: ["themes"] as const,
    list: (name: string, page: number) =>
      ["themes", "list", name, page] as const,
    byCreator: (name: string, page: number) =>
      ["themes", "creator", name, page] as const,
    detail: (id: number) => ["themes", "detail", id] as const,
  },
  questions: {
    all: ["questions"] as const,
    detail: (id: number) => ["questions", "detail", id] as const,
    byThemeTop10: (themeId: string | number) =>
      ["questions", "quiz", themeId] as const,
    byThemeTop10ForPlay: (themeId: string | number) =>
      ["questions", "quiz-play", themeId] as const,
    byCreator: (themeId: number, page: number, title: string) =>
      ["questions", "creator", themeId, page, title] as const,
    byCreatorTop10: (themeId: number) =>
      ["questions", "creator-quiz", themeId] as const,
    byTheme: (themeId: number) => ["questions", "theme", themeId] as const,
  },
  alternatives: {
    all: ["alternatives"] as const,
  },
  responses: {
    all: ["responses"] as const,
    byUser: (page: number) => ["responses", "user", page] as const,
    myResponses: (
      page: number,
      theme: string,
      startDate: string,
      endDate: string,
      gameMode: string
    ) => ["responses", "my", page, theme, startDate, endDate, gameMode] as const,
    mySummary: (
      theme: string,
      startDate: string,
      endDate: string,
      gameMode: string
    ) => ["responses", "my-summary", theme, startDate, endDate, gameMode] as const,
    byQuestionCreator: (page: number) =>
      ["responses", "question-creator", page] as const,
    query: (
      page: number,
      username: string,
      theme: string,
      currentDate: string,
      finalDate: string,
      gameMode: string
    ) =>
      ["responses", "query", page, username, theme, currentDate, finalDate, gameMode] as const,
    queryChart: (
      username: string,
      theme: string,
      currentDate: string,
      finalDate: string,
      gameMode: string
    ) =>
      ["responses", "query-chart", username, theme, currentDate, finalDate, gameMode] as const,
    statistics: (themeName: string, userId: string, gameMode: string) =>
      ["responses", "statistics", themeName, userId, gameMode] as const,
    usernamesByCreator: (creatorId: string) =>
      ["responses", "usernames", creatorId] as const,
    themeNamesByCreator: (creatorId: string) =>
      ["responses", "theme-names", creatorId] as const,
  },
  scores: {
    all: ["scores"] as const,
    rankingByTheme: (themeId: number) => ["scores", "ranking", themeId] as const,
    global: (period: string, page: number) =>
      ["scores", "global", period, page] as const,
  },
  friendship: {
    all: ["friendship"] as const,
    mine: ["friendship", "mine"] as const,
    pending: ["friendship", "pending"] as const,
  },
  matchHistory: {
    all: ["match-history"] as const,
    mine: (page: number) => ["match-history", "mine", page] as const,
    achievements: ["match-history", "achievements"] as const,
  },
  userSearch: {
    byName: (name: string) => ["users", "search", name] as const,
  },
  statistics: {
    all: ["statistics"] as const,
    byCreator: (
      page: number,
      creatorId: string,
      studentName: string,
      themeName: string,
      startDate: string,
      endDate: string
    ) =>
      ["statistics", "creator", page, creatorId, studentName, themeName, startDate, endDate] as const,
    byCreatorChart: (
      creatorId: string,
      studentName: string,
      themeName: string,
      startDate: string,
      endDate: string
    ) =>
      ["statistics", "creator-chart", creatorId, studentName, themeName, startDate, endDate] as const,
    themeNamesByCreator: (creatorId: string) =>
      ["statistics", "theme-names", creatorId] as const,
    studentNamesByCreator: (creatorId: string) =>
      ["statistics", "student-names", creatorId] as const,
  },
  users: {
    all: ["users"] as const,
    me: ["users", "me"] as const,
    list: (userId: string, page: number, name: string) =>
      ["users", "list", userId, page, name] as const,
    isAdmin: (userId: string) => ["users", "is-admin", userId] as const,
    publicProfile: (userId: string) => ["users", "public-profile", userId] as const,
  },
  tournament: {
    state: (code: string) => ["tournament", "state", code] as const,
  },
  wallet: {
    me: ["wallet", "me"] as const,
    transactions: (page: number) => ["wallet", "transactions", page] as const,
  },
  store: {
    items: ["store", "items"] as const,
    inventory: ["store", "inventory"] as const,
  },
} as const;
