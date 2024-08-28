import { apiAxios } from "../axios/AxiosConfig";

export class QuestionService {
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
      response.message = error.response?.data.message || "Erro interno do Servidor!";
    }

    return response;
  }

  insertQuestion(question, idTheme) {
    return this.handleRequest("post", `/question/${idTheme}`, question);
  }

  findQuestionById(questionId) {
    return this.handleRequest("get", `/question/${questionId}`);
  }

  removeQuestion(questionId) {
    return this.handleRequest("delete", `/question/${questionId}`);
  }

  updateQuestion(questionId, questionUpdate) {
    return this.handleRequest("patch", `/question/${questionId}`, questionUpdate);
  }

  find10QuestionsByThemeId(themeId) {
    return this.handleRequest("get", `/question/quiz/${themeId}`);
  }

  findQuestionsByCreator(themeId, currentPage, title) {
    return this.handleRequest("get", `/question/creator/theme/${themeId}?page=${currentPage}&title=${title}`);
  }

  find10QuestionsByThemeIdAndCreatorId(themeId) {
    return this.handleRequest("get", `/question/creator/quiz/${themeId}`);
  }

  findAllQuestionsByTheme(themeId) {
    return this.handleRequest("get", `/question/all/theme/${themeId}`);
  }
}