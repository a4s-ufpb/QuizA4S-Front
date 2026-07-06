import { useMutation, useQuery } from "@tanstack/react-query";
import { TournamentService } from "../service/TournamentService";
import { queryKeys } from "./queryKeys";
import type { CreateTournamentRequest } from "../types/tournament";

const tournamentService = new TournamentService();

export function useCreateTournamentMutation() {
  return useMutation({
    mutationFn: (request: CreateTournamentRequest) => tournamentService.create(request),
  });
}

export function useJoinTournamentMutation() {
  return useMutation({
    mutationFn: ({ code, playerId, name }: { code: string; playerId: string; name: string }) =>
      tournamentService.join(code, playerId, name),
  });
}

export function useStartTournamentMutation() {
  return useMutation({
    mutationFn: ({ code, hostId }: { code: string; hostId: string }) =>
      tournamentService.start(code, hostId),
  });
}

export function useTournamentStateQuery(code: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.tournament.state(code),
    queryFn: () => tournamentService.getState(code),
    enabled: enabled && Boolean(code),
    refetchInterval: enabled ? 3000 : false,
  });
}
