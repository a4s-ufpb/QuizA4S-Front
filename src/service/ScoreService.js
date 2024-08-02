import { apiAxios } from "../axios/AxiosConfig";

export class UserService {
  async insertScore(score, userId, themeId) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.post(`/score/${userId}/${themeId}`, score);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async findRankingByTheme(themeId) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get(`/score/${themeId}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }
}
