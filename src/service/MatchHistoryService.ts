import { BaseService } from "./BaseService";
import type { AchievementResponse, MatchHistoryResponse, Page } from "../types";

interface MatchHistoryRequest {
  mode: "SINGLE_PLAYER" | "MULTIPLAYER";
  themeName: string;
  score: number;
  total: number;
}

export class MatchHistoryService extends BaseService {
  recordMatch(request: MatchHistoryRequest) {
    return this.handleRequest<MatchHistoryResponse>(
      "post",
      "/match-history",
      request
    );
  }

  findMyHistory(page = 0, size = 10) {
    return this.handleRequest<Page<MatchHistoryResponse>>(
      "get",
      `/match-history/mine?page=${page}&size=${size}`
    );
  }

  findMyAchievements() {
    return this.handleRequest<AchievementResponse[]>(
      "get",
      "/match-history/achievements"
    );
  }
}
