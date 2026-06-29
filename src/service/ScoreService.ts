import { BaseService } from "./BaseService";
import type { Score, ScoreRequest } from "../types";

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
}
