import { BaseService } from "./BaseService";

export class RoomService extends BaseService {
  createRoom(roomRequest: unknown) {
    return this.handleRequest("post", `/room`, roomRequest);
  }

  joinRoom(roomId: string, playerId: string) {
    return this.handleRequest("patch", `/room/${roomId}/${playerId}`);
  }

  selectQuiz(roomId: string, quizId: number) {
    return this.handleRequest("patch", `/room/select-quiz/${roomId}/${quizId}`);
  }

  startQuiz(roomId: string) {
    return this.handleRequest("patch", `/room/start-quiz/${roomId}`);
  }

  quitRoom(roomId: string, playerId: string) {
    return this.handleRequest("patch", `/room/quit/${roomId}/${playerId}`);
  }

  deleteRoom(roomId: string) {
    return this.handleRequest("delete", `/room/${roomId}`);
  }

  findRoomById(roomId: string) {
    return this.handleRequest("get", `/room/${roomId}`);
  }
}
