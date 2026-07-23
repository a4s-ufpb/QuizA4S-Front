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

  join(code: string, playerId: string, name: string, userUuid: string) {
    return this.handleRequest<TournamentState>("post", `/tournament/${code}/join`, {
      playerId,
      name,
      userUuid,
    });
  }

  start(code: string, hostId: string) {
    return this.handleRequest<TournamentState>("post", `/tournament/${code}/start`, {
      hostId,
    });
  }

  configure(code: string, hostId: string) {
    return this.handleRequest<TournamentState>("post", `/tournament/${code}/configure`, {
      hostId,
    });
  }

  reopen(code: string, hostId: string) {
    return this.handleRequest<TournamentState>("post", `/tournament/${code}/reopen`, {
      hostId,
    });
  }

  setRoundTheme(code: string, hostId: string, roundIndex: number, themeId: number) {
    return this.handleRequest<TournamentState>("post", `/tournament/${code}/round-theme`, {
      hostId,
      roundIndex,
      themeId,
    });
  }

  kick(code: string, hostId: string, targetId: string) {
    return this.handleRequest<TournamentState>("post", `/tournament/${code}/kick`, {
      hostId,
      targetId,
    });
  }

  leave(code: string, playerId: string) {
    return this.handleRequest<TournamentState>("post", `/tournament/${code}/leave`, {
      playerId,
    });
  }
}
