import { BaseService } from "./BaseService";
import type { CreateRoomRequest, RoomState } from "../types/game";

/** REST público do modo multiplayer (criar / consultar sala). */
export class GameService extends BaseService {
  createRoom(request: CreateRoomRequest) {
    return this.handleRequest<RoomState>("post", "/game/room", request);
  }

  findRoomByCode(code: string) {
    return this.handleRequest<RoomState>("get", `/game/room/${code}`);
  }
}
