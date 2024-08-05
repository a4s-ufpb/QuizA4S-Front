export class SearchImageService {
  constructor() {
    this.clientID = "VobhRhGYqprkaxYAvXjE07UsDOglWJwSU4cHbpWu0qGphVyZQUGW3CSS";
    this.baseUrl = "https://api.pexels.com/v1/search";
  }

  async searchImages(imageName, currentPage = 1) {
    const apiImageUrl = `${this.baseUrl}?query=${imageName}&per_page=40&page=${currentPage}`;
    try {
      const response = await fetch(apiImageUrl, {
        headers: {
          Authorization: this.clientID,
        },
      });
      if (!response.ok) {
        throw new Error("Erro na requisição da API");
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
        message: error.message,
      };
    }
  }
}
