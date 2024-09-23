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
        error.response?.data.message || "Tente novamente mais tarde!";
    }

    return response;
  }

  createRoom(roomRequest) {
    return this.handleRequest("post", `/room`, roomRequest);
  }

  joinRoom(roomId, playerId) {
    return this.handleRequest("patch", `/room/${roomId}/${playerId}`);
  }

  selectQuiz(roomId, quizId) {
    return this.handleRequest("patch", `/room/select-quiz/${roomId}/${quizId}`);
  }

  startQuiz(roomId) {
    return this.handleRequest("patch", `/room/start-quiz/${roomId}`);
  }

  quitRoom(roomId, playerId) {
    return this.handleRequest("patch", `/room/quit/${roomId}/${playerId}`);
  }

  deleteRoom(roomId) {
    return this.handleRequest("delete", `/room/${roomId}`);
  }

  findRoomById(roomId) {
    return this.handleRequest("get", `/room/${roomId}`);
  }
}
