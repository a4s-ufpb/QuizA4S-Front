import { apiAxios } from "../axios/AxiosConfig";

export class UserService {
  async insertResponse(idUser, idQuestion, idAlternative) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.post(`/response/${idUser}/${idQuestion}/${idAlternative}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async findResponsesByUser() {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get("/response/user");

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async findResponsesByQuestionCreator() {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get(`/response/question/creator`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async findResponsesByQuestionCreatorId(questionId) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get(`/response/question/creator/id?questionId=${questionId}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async findResponsesByUserName(name) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get(`/response/question/creator?name=${name}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async findResponsesByDate(currentDate, finalDate) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get(`/response/question/date?currentDate=${currentDate}&finalDate=${finalDate}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async findResponsesStatistics(themeName) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get(`/response/statistic/${themeName}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async removeResponse(responseId) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.delete(`/response/${responseId}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }
}
