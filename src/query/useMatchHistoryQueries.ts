import { useMutation, useQuery } from "@tanstack/react-query";
import { MatchHistoryService } from "../service/MatchHistoryService";
import { queryKeys } from "./queryKeys";

const matchHistoryService = new MatchHistoryService();

export function useMyMatchHistoryQuery(page = 0, enabled = true) {
  return useQuery({
    queryKey: queryKeys.matchHistory.mine(page),
    queryFn: () => matchHistoryService.findMyHistory(page),
    enabled,
  });
}

export function useMyAchievementsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.matchHistory.achievements,
    queryFn: () => matchHistoryService.findMyAchievements(),
    enabled,
  });
}

export function useRecordMatchMutation() {
  return useMutation({
    mutationFn: (request: {
      mode: "SINGLE_PLAYER" | "MULTIPLAYER";
      themeName: string;
      score: number;
      total: number;
    }) => matchHistoryService.recordMatch(request),
  });
}
