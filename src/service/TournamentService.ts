import { BaseService } from "./BaseService";
import type { CreateTournamentRequest, TournamentState } from "../types/tournament";

/** REST público do modo torneio (criar / entrar / iniciar / consultar bracket). */
export class TournamentService extends BaseService {
  create(request: CreateTournamentRequest) {
    return this.handleRequest<TournamentState>("post", "/tournament", request);
  }

  getState(code: string) {
    return this.handleRequest<TournamentState>("get", `/tournament/${code}`);
  }

  join(code: string, playerId: string, name: string) {
    return this.handleRequest<TournamentState>("post", `/tournament/${code}/join`, {
      playerId,
      name,
    });
  }

  start(code: string, hostId: string) {
    return this.handleRequest<TournamentState>("post", `/tournament/${code}/start`, {
      hostId,
    });
  }
}
