import { BaseService } from "./BaseService";
import type { Tag } from "../types";

export class TagService extends BaseService {
  create(name: string) {
    return this.handleRequest<Tag>("post", "/tag", { name });
  }

  listMine() {
    return this.handleRequest<Tag[]>("get", "/tag/mine");
  }

  listAll() {
    return this.handleRequest<Tag[]>("get", "/tag/all");
  }

  listByCreator(uuid: string) {
    return this.handleRequest<Tag[]>("get", `/tag/creator/${uuid}`);
  }

  update(id: number, name: string) {
    return this.handleRequest<Tag>("patch", `/tag/${id}`, { name });
  }

  remove(id: number) {
    return this.handleRequest<void>("delete", `/tag/${id}`);
  }
}
