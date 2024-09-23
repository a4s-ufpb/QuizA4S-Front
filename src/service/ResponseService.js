import { apiAxios } from "../axios/AxiosConfig";

export class ResponseService {
  async handleRequest(method, url, data = null) {
    const response = {
      data: {},
      message: "",
      success: false,
    };

    try {
      const asyncResponse = await apiAxios[method](url, data);
      response.data = asyncResponse.data;
      response.success = true;
    } catch (error) {
      response.message =
        error.response?.data.message || "Tente novamente mais tarde!";
    }

    return response;
  }

  insertResponse(idUser, idQuestion, idAlternative) {
    return this.handleRequest(
      "post",
      `/response/${idUser}/${idQuestion}/${idAlternative}`
    );
  }

  findResponsesByUser(currentPage) {
    return this.handleRequest("get", `/response/user?page=${currentPage}`);
  }

  findResponsesByQuestionCreator(currentPage) {
    return this.handleRequest(
      "get",
      `/response/question/creator?page=${currentPage}`
    );
  }

  findResponsesByQuestionCreatorAndUsernameAndDate(
    currentPage,
    username,
    currentDate,
    finalDate
  ) {
    return this.handleRequest(
      "get",
      `/response/username/date?page=${currentPage}&username=${username}&currentDate=${currentDate}&finalDate=${finalDate}`
    );
  }

  findResponsesStatistics(themeName, userId) {
    return this.handleRequest(
      "get",
      `/response/statistic/${themeName}/${userId}`
    );
  }

  removeResponse(responseId) {
    return this.handleRequest("delete", `/response/${responseId}`);
  }
}
