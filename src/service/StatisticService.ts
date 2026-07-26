import { AxiosError } from "axios";
import { BaseService } from "./BaseService";
import { apiAxios } from "../axios/AxiosConfig";
import type { ApiResult, GameMode, Page, Statistic, StatisticRequest } from "../types";

export class StatisticService extends BaseService {
  async insertStatistic(statistic: StatisticRequest, studentUuid?: string) {
    const response: ApiResult<Statistic> = {
      data: {} as Statistic,
      message: "",
      success: false,
    };
    try {
      const res = await apiAxios.request<Statistic>({
        method: "post",
        url: "/statistic",
        data: statistic,
        headers: studentUuid ? { "X-Student-Uuid": studentUuid } : {},
      });
      response.data = res.data;
      response.success = true;
    } catch (error) {
      const ax = error as AxiosError<{ message?: string }>;
      response.message = ax.response?.data?.message || "Tente novamente mais tarde!";
    }
    return response;
  }

  findAllStatisticByCreator(
    currentPage: number,
    creatorId: string,
    studentName: string,
    themeName: string,
    startDate: string,
    endDate: string,
    gameMode: GameMode | "",
    size?: number
  ) {
    const modeQuery = gameMode ? `&gameMode=${gameMode}` : "";
    const sizeQ = size != null ? `&size=${size}` : "";
    return this.handleRequest<Page<Statistic>>(
      "get",
      `/statistic/${creatorId}?page=${currentPage}&studentName=${studentName}&themeName=${themeName}&startDate=${startDate}&endDate=${endDate}${modeQuery}${sizeQ}`
    );
  }

  findAllStatisticByCreatorForChart(
    creatorId: string,
    studentName: string,
    themeName: string,
    startDate: string,
    endDate: string,
    gameMode: GameMode | ""
  ) {
    const modeQuery = gameMode ? `&gameMode=${gameMode}` : "";
    return this.handleRequest<Statistic[]>(
      "get",
      `/statistic/${creatorId}/chart?studentName=${studentName}&themeName=${themeName}&startDate=${startDate}&endDate=${endDate}${modeQuery}`
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
