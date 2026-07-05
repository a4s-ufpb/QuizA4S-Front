import { BaseService } from "./BaseService";
import type { RoomInviteResponse } from "../types";

export class RoomInviteService extends BaseService {
  sendInvite(targetId: string, roomCode: string) {
    return this.handleRequest<void>("post", `/room-invite/${targetId}`, {
      roomCode,
    });
  }

  findMyInvite() {
    return this.handleRequest<RoomInviteResponse | null>(
      "get",
      "/room-invite/mine"
    );
  }

  dismissInvite() {
    return this.handleRequest<void>("delete", "/room-invite/mine");
  }
}
