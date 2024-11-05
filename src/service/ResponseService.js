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

  findResponsesByQuestionCreatorAndUsernameAndDateAndThemeName(
    currentPage,
    username,
    themeName,
    currentDate,
    finalDate
  ) {
    return this.handleRequest(
      "get",
      `/response/query?page=${currentPage}&username=${username}&currentDate=${currentDate}&finalDate=${finalDate}&theme=${themeName}`
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

  findUsernamesByCreator(creatorId) {
    return this.handleRequest("get", `/response/usernames/${creatorId}`);
  }

  findThemeNamesByCreator(creatorId) {
    return this.handleRequest("get", `/response/themes/${creatorId}`);
  }

}
