import { PEXELS_CLIENT_ID, PEXELS_URL } from './../vite-env'

export class SearchImageService {
  constructor() {
    this.clientID = PEXELS_CLIENT_ID;
    this.baseUrl = PEXELS_URL;
  }

  async searchImages(imageName, currentPage) {
    const apiImageUrl = `${this.baseUrl}?query=${imageName}&per_page=40&page=${currentPage}&locale=pt-BR`;
    try {
      const response = await fetch(apiImageUrl);
      if (!response.ok) {
        throw new Error("Erro na requisição da API");
      }
      const data = await response.json();
      return {
        success: true,
        items: data.items,
        currentPage: currentPage,
        totalPages: Math.ceil(data.searchInformation.totalResults / 10),
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
