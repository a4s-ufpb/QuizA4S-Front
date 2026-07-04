import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScoreService } from "../service/ScoreService";
import { queryKeys } from "./queryKeys";
import type { ScoreRequest } from "../types";

const scoreService = new ScoreService();

export function useRankingByThemeQuery(themeId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.scores.rankingByTheme(themeId),
    queryFn: () => scoreService.findRankingByTheme(themeId),
    enabled: enabled && Boolean(themeId),
  });
}

export function useInsertScoreMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      score,
      userId,
      themeId,
    }: {
      score: ScoreRequest;
      userId: string;
      themeId: number;
    }) => scoreService.insertScore(score, userId, themeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scores.all });
    },
  });
}
