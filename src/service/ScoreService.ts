import { BaseService } from "./BaseService";
import type { Score, ScoreRequest, GlobalRankingResponse, Page } from "../types";

export class ScoreService extends BaseService {
  insertScore(score: ScoreRequest, userId: string, themeId: number) {
    return this.handleRequest<Score>(
      "post",
      `/score/${userId}/${themeId}`,
      score
    );
  }

  findRankingByTheme(themeId: number) {
    return this.handleRequest<Score[]>("get", `/score/${themeId}`);
  }

  findGlobalRanking(period: "ALL" | "WEEK", page = 0, size = 20) {
    return this.handleRequest<Page<GlobalRankingResponse>>(
      "get",
      `/score/global?period=${period}&page=${page}&size=${size}`
    );
  }
}
