import { BaseService } from "./BaseService";
import type { Page, ResponseItem, ResponseStatistic } from "../types";

export class ResponseService extends BaseService {
  insertResponse(idUser: string, idQuestion: number, idAlternative: number) {
    return this.handleRequest<ResponseItem>(
      "post",
      `/response/${idUser}/${idQuestion}/${idAlternative}`
    );
  }

  findResponsesByUser(currentPage: number) {
    return this.handleRequest<Page<ResponseItem>>(
      "get",
      `/response/user?page=${currentPage}`
    );
  }

  findResponsesByQuestionCreator(currentPage: number) {
    return this.handleRequest<Page<ResponseItem>>(
      "get",
      `/response/question/creator?page=${currentPage}`
    );
  }

  findResponsesByQuestionCreatorAndUsernameAndDateAndThemeName(
    currentPage: number,
    username: string,
    themeName: string,
    currentDate: string,
    finalDate: string
  ) {
    return this.handleRequest<Page<ResponseItem>>(
      "get",
      `/response/query?page=${currentPage}&username=${username}&currentDate=${currentDate}&finalDate=${finalDate}&theme=${themeName}`
    );
  }

  findResponsesStatistics(themeName: string, userId: string) {
    return this.handleRequest<ResponseStatistic[]>(
      "get",
      `/response/statistic/${themeName}/${userId}`
    );
  }

  removeResponse(responseId: number) {
    return this.handleRequest<void>("delete", `/response/${responseId}`);
  }

  findUsernamesByCreator(creatorId: string) {
    return this.handleRequest<{ username: string }[]>(
      "get",
      `/response/usernames/${creatorId}`
    );
  }

  findThemeNamesByCreator(creatorId: string) {
    return this.handleRequest<{ themeName: string }[]>(
      "get",
      `/response/themes/${creatorId}`
    );
  }
}
