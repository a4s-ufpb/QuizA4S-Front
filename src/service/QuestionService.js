import { apiAxios } from "../axios/AxiosConfig";

export class UserService {
  async insertQuestion(question, idTheme) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.post(`/question/${idTheme}`, question);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }


  async findQuestionById(questionId) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get(`/question/${questionId}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async removeQuestion(questionId) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.delete(`/question/${questionId}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async updateQuestion(questionId, questionUpdate) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.patch(`/question/${questionId}`, questionUpdate);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async find10QuestionsByThemeId(themeId) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get(`/question/quiz/${themeId}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async findQuestionsByCreator(themeId) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get(`/question/creator/theme/${themeId}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async find10QuestionsByThemeIdAndCreatorId(themeId) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get(`/question/creator/quiz/${themeId}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async findAllQuestionsByTheme(themeId) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get(`/question/all/theme/${themeId}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }
}
