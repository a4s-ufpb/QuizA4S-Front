import { PEXELS_CLIENT_ID, PEXELS_URL } from "../vite-env";

export class SearchImageService {
  constructor() {
    this.clientID = PEXELS_CLIENT_ID;
    this.baseUrl = PEXELS_URL;
  }

  async searchImages(imageName, currentPage) {
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
      const data = await response.json();
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