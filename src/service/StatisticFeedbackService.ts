import { BaseService } from "./BaseService";
import type { StatisticFeedback } from "../types";

export class StatisticFeedbackService extends BaseService {
  create(statisticId: number, text: string) {
    return this.handleRequest<StatisticFeedback>(
      "post",
      `/statistic-feedback/statistic/${statisticId}`,
      { text }
    );
  }

  byStatistic(statisticId: number) {
    return this.handleRequest<StatisticFeedback[]>(
      "get",
      `/statistic-feedback/statistic/${statisticId}`
    );
  }

  mine() {
    return this.handleRequest<StatisticFeedback[]>("get", "/statistic-feedback/mine");
  }

  creatorMine() {
    return this.handleRequest<StatisticFeedback[]>("get", "/statistic-feedback/creator/mine");
  }
}
