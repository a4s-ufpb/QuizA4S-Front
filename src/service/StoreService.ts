import { BaseService } from "./BaseService";
import type { StoreItemResponse, User } from "../types";

export class StoreService extends BaseService {
  findCatalog() {
    return this.handleRequest<StoreItemResponse[]>("get", "/store/items");
  }

  findMyInventory() {
    return this.handleRequest<string[]>("get", "/store/inventory");
  }

  purchase(itemCode: string) {
    return this.handleRequest<StoreItemResponse>("post", `/store/purchase/${itemCode}`);
  }

  equip(itemCode: string) {
    return this.handleRequest<User>("patch", `/store/equip/${itemCode}`);
  }

  unequip(category: string) {
    return this.handleRequest<User>("delete", `/store/equip/${category}`);
  }
}
