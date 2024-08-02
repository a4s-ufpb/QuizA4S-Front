import { apiAxios } from "../axios/AxiosConfig";

export class UserService {
  async registerUser(user) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.post("/user/register", user);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async loginUser(userLogin) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.post("/user/login", userLogin);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async findUser(userId) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.get(`/user/find/${userId}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async removeUser(userId) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.delete(`/user/${userId}`);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }

  async updateUser(userId, userUpdate) {
    const response = {
      data: {},
      message: "",
    };

    try {
      const asyncResponse = await apiAxios.patch(`/user/${userId}`, userUpdate);

      const data = asyncResponse.data;

      response.data = data;
      return response;
    } catch (error) {
      response.message = error.response.data;
      return response;
    }
  }
}
