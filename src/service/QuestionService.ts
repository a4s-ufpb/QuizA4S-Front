import { BaseService } from "./BaseService";
import type { Page, Question, QuizQuestion } from "../types";

export class QuestionService extends BaseService {
  insertQuestion(formData: FormData, idTheme: number) {
    return this.handleMultipartRequest<Question>("post", `/question/${idTheme}`, formData);
  }

  findQuestionById(questionId: number) {
    return this.handleRequest<Question>("get", `/question/${questionId}`);
  }

  removeQuestion(questionId: number) {
    return this.handleRequest<void>("delete", `/question/${questionId}`);
  }

  updateQuestion(questionId: number, formData: FormData) {
    return this.handleMultipartRequest<Question>("patch", `/question/${questionId}`, formData);
  }

  find10QuestionsByThemeId(themeId: string | number) {
    return this.handleRequest<Question[]>("get", `/question/quiz/${themeId}`);
  }

  find10QuestionsForPlay(themeId: string | number) {
    return this.handleRequest<QuizQuestion[]>(
      "get",
      `/question/quiz/${themeId}/play`
    );
  }

  findQuestionsByCreator(themeId: number, currentPage: number, title: string) {
    return this.handleRequest<Page<Question>>(
      "get",
      `/question/creator/theme/${themeId}?page=${currentPage}&title=${title}`
    );
  }

  find10QuestionsByThemeIdAndCreatorId(themeId: number) {
    return this.handleRequest<Question[]>(
      "get",
      `/question/creator/quiz/${themeId}`
    );
  }

  findAllQuestionsByTheme(themeId: number) {
    return this.handleRequest<Question[]>(
      "get",
      `/question/all/theme/${themeId}`
    );
  }
}
