import { BaseService } from "./BaseService";
import type { Page, Theme } from "../types";

export class ThemeService extends BaseService {
  insertTheme(formData: FormData) {
    return this.handleMultipartRequest<Theme>("post", "/theme", formData);
  }

  removeTheme(themeId: number) {
    return this.handleRequest<void>("delete", `/theme/${themeId}`);
  }

  findAllThemes(name: string, currentPage: number) {
    return this.handleRequest<Page<Theme>>(
      "get",
      `/theme?name=${name}&page=${currentPage}`
    );
  }

  findThemesByCreator(name: string, currentPage: number) {
    return this.handleRequest<Page<Theme>>(
      "get",
      `/theme/creator?name=${name}&page=${currentPage}`
    );
  }

  findThemeById(idTheme: number) {
    return this.handleRequest<Theme>("get", `/theme/${idTheme}`);
  }

  updateTheme(themeId: number, formData: FormData) {
    return this.handleMultipartRequest<Theme>("patch", `/theme/${themeId}`, formData);
  }
}
