export class SearchImageService {
  constructor() {
    this.apiKey = "AIzaSyDxagnZ5bwHhIlnliosssHI_gs_IAu9oGY";
    this.searchEngineId = "22c72f5351eb142f7";
    this.baseUrl = "https://www.googleapis.com/customsearch/v1";
  }

  async searchImages(query, currentPage = 1) {
    const startIndex = (currentPage - 1) * 10 + 1;
    const apiUrl = `${this.baseUrl}?key=${this.apiKey}&cx=${this.searchEngineId}&searchType=image&q=${query}&start=${startIndex}`;
    try {
      const response = await fetch(apiUrl);
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
