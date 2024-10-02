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
      response.message = error.response?.data.message || "Tente novamente mais tarde!";
    }

    return response;
  }

  insertStatistic(statistic) {
    return this.handleRequest("post", "/statistic", statistic);
  }

  findAllStatisticByCreator(currentPage, creatorId, studentName, themeName, startDate, endDate) {
    return this.handleRequest("get", `/statistic/${creatorId}?page=${currentPage}&studentName=${studentName}&themeName=${themeName}&startDate=${startDate}&endDate=${endDate}`);
  }

  findDistinctThemeNameByCreatorId(creatorId) {
    return this.handleRequest("get", `/statistic/theme/${creatorId}`)
  }

  findDistinctStudentNameByCreatorId(creatorId) {
    return this.handleRequest("get", `/statistic/student/${creatorId}`)
  }
}