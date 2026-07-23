import { useMutation } from "@tanstack/react-query";
import { TournamentService } from "../service/TournamentService";
import type { CreateTournamentRequest } from "../types/tournament";

const tournamentService = new TournamentService();

export function useCreateTournamentMutation() {
  return useMutation({
    mutationFn: (request: CreateTournamentRequest) => tournamentService.create(request),
  });
}

export function useJoinTournamentMutation() {
  return useMutation({
    mutationFn: ({
      code,
      playerId,
      name,
      userUuid,
    }: {
      code: string;
      playerId: string;
      name: string;
      userUuid: string;
    }) => tournamentService.join(code, playerId, name, userUuid),
  });
}

export function useStartTournamentMutation() {
  return useMutation({
    mutationFn: ({ code, hostId }: { code: string; hostId: string }) =>
      tournamentService.start(code, hostId),
  });
}

export function useConfigureTournamentMutation() {
  return useMutation({
    mutationFn: ({ code, hostId }: { code: string; hostId: string }) =>
      tournamentService.configure(code, hostId),
  });
}

export function useReopenTournamentMutation() {
  return useMutation({
    mutationFn: ({ code, hostId }: { code: string; hostId: string }) =>
      tournamentService.reopen(code, hostId),
  });
}

export function useSetRoundThemeMutation() {
  return useMutation({
    mutationFn: ({
      code,
      hostId,
      roundIndex,
      themeId,
    }: {
      code: string;
      hostId: string;
      roundIndex: number;
      themeId: number;
    }) => tournamentService.setRoundTheme(code, hostId, roundIndex, themeId),
  });
}

export function useKickTournamentPlayerMutation() {
  return useMutation({
    mutationFn: ({ code, hostId, targetId }: { code: string; hostId: string; targetId: string }) =>
      tournamentService.kick(code, hostId, targetId),
  });
}

export function useLeaveTournamentMutation() {
  return useMutation({
    mutationFn: ({ code, playerId }: { code: string; playerId: string }) =>
      tournamentService.leave(code, playerId),
  });
}
