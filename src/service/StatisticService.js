import { apiAxios } from "../axios/AxiosConfig";

export class StatisticService {
  async handleRequest(method, url, data = null) {
    const response = {
      data: {},
      message: "",
      success: false
    };

    try {
      const asyncResponse = await apiAxios[method](url, data);
      response.data = asyncResponse.data;
      response.success = true;
    } catch (error) {
      response.message = error.response?.data.message || "Erro interno do Servidor!";
    }

    return response;
  }

  insertStatistic(statistic) {
    return this.handleRequest("post", "/statistic", statistic);
  }

  findAllStatisticByCreator(currentPage, creatorId, studentName, themeName) {
    return this.handleRequest("get", `/statistic/${creatorId}?page=${currentPage}&studentName=${studentName}&themeName=${themeName}`);
  }
}