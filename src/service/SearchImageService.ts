import { PEXELS_CLIENT_ID, PEXELS_URL } from "../vite-env";
import type { PexelsSearchResult } from "../types";

interface SearchImagesResult {
  success: boolean;
  data?: PexelsSearchResult;
  message?: string;
}

export class SearchImageService {
  private clientID = PEXELS_CLIENT_ID;
  private baseUrl = PEXELS_URL;

  async searchImages(
    imageName: string,
    currentPage: number
  ): Promise<SearchImagesResult> {
    const apiImageUrl = `${this.baseUrl}?query=${imageName}&per_page=40&page=${currentPage}&locale=pt-BR`;
    try {
      const response = await fetch(apiImageUrl, {
        headers: {
          Authorization: this.clientID,
        },
      });
      if (!response.ok) {
        throw new Error("Tente novamente mais tarde!");
      }
      const data: PexelsSearchResult = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Tente novamente mais tarde!",
      };
    }
  }
}
