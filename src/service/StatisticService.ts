import { BaseService } from "./BaseService";
import type { Page, Statistic, StatisticRequest } from "../types";

export class StatisticService extends BaseService {
  insertStatistic(statistic: StatisticRequest) {
    return this.handleRequest<Statistic>("post", "/statistic", statistic);
  }

  findAllStatisticByCreator(
    currentPage: number,
    creatorId: string,
    studentName: string,
    themeName: string,
    startDate: string,
    endDate: string
  ) {
    return this.handleRequest<Page<Statistic>>(
      "get",
      `/statistic/${creatorId}?page=${currentPage}&studentName=${studentName}&themeName=${themeName}&startDate=${startDate}&endDate=${endDate}`
    );
  }

  findDistinctThemeNameByCreatorId(creatorId: string) {
    return this.handleRequest<{ themeName: string }[]>(
      "get",
      `/statistic/theme/${creatorId}`
    );
  }

  findDistinctStudentNameByCreatorId(creatorId: string) {
    return this.handleRequest<{ studentName: string }[]>(
      "get",
      `/statistic/student/${creatorId}`
    );
  }
}
