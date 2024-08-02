import { apiAxios } from "../axios/AxiosConfig";

export class UserService {
  async insertTheme(theme) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.post("/theme", theme);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async removeTheme(themeId) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.delete(`/theme/${themeId}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async findAllThemes(name) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get(`/theme?name=${name}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async findThemesByCreator(name) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get(`/theme/creator?name=${name}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async findThemeById(idTheme) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get(`/theme/${idTheme}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async updateTheme(themeId, themeUpdate) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.patch(`/theme/${themeId}`, themeUpdate);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }
}
