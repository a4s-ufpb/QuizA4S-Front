import { API_URL } from "../vite-env";
import type { ApiFetchResult } from "../types";

export class ApiFetch {
  async getPages<T = unknown>(
    basePath = "",
    messageNotFound = "Página não encontrada"
  ): Promise<ApiFetchResult<T>> {
    const info: ApiFetchResult<T> = {
      message: "",
      success: false,
      data: [],
      totalPages: 0,
    };

    const token = localStorage.getItem("token");

    let response: Response;
    try {
      if (token) {
        response = await fetch(`${API_URL}${basePath}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await fetch(`${API_URL}${basePath}`);
      }

      switch (response.status) {
        case 403:
        case 500:
          return { ...info, message: "Erro ao buscar dados. Tente novamente!" };
        case 404:
          return { ...info, message: messageNotFound };
        default:
          break;
      }

      const responseJson = await response.json();
      const { content, totalPages } = responseJson;

      return {
        ...info,
        message: "OK",
        success: true,
        data: content || [],
        totalPages: totalPages || 0,
      };
    } catch (error) {
      return {
        ...info,
        message: `Erro de conexão, tente novamente mais tarde!`,
      };
    }
  }
}
