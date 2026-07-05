import { useQuery } from "@tanstack/react-query";
import { ScoreService } from "../service/ScoreService";
import { queryKeys } from "./queryKeys";

const scoreService = new ScoreService();

export function useGlobalRankingQuery(period: "ALL" | "WEEK", page = 0, enabled = true) {
  return useQuery({
    queryKey: queryKeys.scores.global(period, page),
    queryFn: () => scoreService.findGlobalRanking(period, page),
    enabled,
  });
}
