import { apiAxios } from "../axios/AxiosConfig";

export class RoomService {
  async handleRequest(method, url, data = null) {
    const response = {
      data: {},
      message: "",
      success: false,
    };

    try {
      const asyncResponse = await apiAxios[method](url, data);
      response.data = asyncResponse.data;
      response.success = true;
    } catch (error) {
      response.message =
        error.response?.data.message || "Erro interno do Servidor!";
    }

    return response;
  }

  createRoom(roomRequest) {
    return this.handleRequest("post", `/room`, roomRequest);
  }

  joinRoom(roomId) {
    return this.handleRequest("get", `/room/${roomId}`);
  }

  selectQuiz(roomId, quizId) {
    return this.handleRequest("patch", `/room/select-quiz/${roomId}/${quizId}`);
  }

  startQuiz(roomId) {
    return this.handleRequest("patch", `/room/start-quiz/${roomId}`);
  }
}
