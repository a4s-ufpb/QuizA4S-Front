import { BaseService } from "./BaseService";
import type { Page, Theme } from "../types";

export class ThemeService extends BaseService {
  insertTheme(theme: Partial<Theme>) {
    return this.handleRequest<Theme>("post", "/theme", theme);
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

  updateTheme(themeId: number, themeUpdate: Partial<Theme>) {
    return this.handleRequest<Theme>("patch", `/theme/${themeId}`, themeUpdate);
  }
}
