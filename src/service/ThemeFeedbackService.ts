import { BaseService } from "./BaseService";
import type { ThemeFeedback } from "../types";

export class ThemeFeedbackService extends BaseService {
  create(themeId: number, text: string) {
    return this.handleRequest<ThemeFeedback>(
      "post",
      `/theme-feedback/theme/${themeId}`,
      { text }
    );
  }

  listByTheme(themeId: number) {
    return this.handleRequest<ThemeFeedback[]>(
      "get",
      `/theme-feedback/theme/${themeId}`
    );
  }

  count(themeId: number) {
    return this.handleRequest<number>("get", `/theme-feedback/theme/${themeId}/count`);
  }
}
