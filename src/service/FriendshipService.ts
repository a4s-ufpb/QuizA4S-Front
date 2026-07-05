import { BaseService } from "./BaseService";
import type { FriendshipResponse } from "../types";

export class FriendshipService extends BaseService {
  requestFriendship(targetId: string) {
    return this.handleRequest<FriendshipResponse>(
      "post",
      `/friendship/request/${targetId}`
    );
  }

  acceptFriendship(friendshipId: number) {
    return this.handleRequest<FriendshipResponse>(
      "patch",
      `/friendship/${friendshipId}/accept`
    );
  }

  removeFriendship(friendshipId: number) {
    return this.handleRequest<void>("delete", `/friendship/${friendshipId}`);
  }

  findMyFriends() {
    return this.handleRequest<FriendshipResponse[]>("get", "/friendship/mine");
  }

  findPendingRequests() {
    return this.handleRequest<FriendshipResponse[]>(
      "get",
      "/friendship/pending"
    );
  }
}
