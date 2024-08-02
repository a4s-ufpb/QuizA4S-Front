import { apiAxios } from "../axios/AxiosConfig";

export class UserService {
  async insertAlternative(idQuestion, alternative) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.post(`/alternative/${idQuestion}`, alternative);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async insertAllAlternatives(idQuestion, alternatives) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.post(`/alternative/all/${idQuestion}`, alternatives);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async removeAlternative(alternativeId) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.delete(`/alternative/${alternativeId}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async updateAlternative(alternativeId, alternativeUpdate) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.patch(`/alternative/${alternativeId}`, alternativeUpdate);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }
}
