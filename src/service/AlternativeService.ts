import { BaseService } from "./BaseService";
import type { Alternative } from "../types";

export class AlternativeService extends BaseService {
  insertAlternative(idQuestion: number, alternative: Alternative) {
    return this.handleRequest<Alternative>(
      "post",
      `/alternative/${idQuestion}`,
      alternative
    );
  }

  insertAllAlternatives(idQuestion: number, alternatives: Alternative[]) {
    return this.handleRequest<Alternative[]>(
      "post",
      `/alternative/all/${idQuestion}`,
      alternatives
    );
  }

  removeAlternative(alternativeId: number) {
    return this.handleRequest<void>("delete", `/alternative/${alternativeId}`);
  }

  updateAlternative(
    alternativeId: number,
    alternativeUpdate: Partial<Alternative>
  ) {
    return this.handleRequest<Alternative>(
      "patch",
      `/alternative/${alternativeId}`,
      alternativeUpdate
    );
  }
}
