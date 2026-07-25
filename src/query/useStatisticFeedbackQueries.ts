import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StatisticFeedbackService } from "../service/StatisticFeedbackService";
import { queryKeys } from "./queryKeys";

const service = new StatisticFeedbackService();

export function useStatisticFeedbackByStatQuery(statId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.statisticFeedback.byStatistic(statId),
    queryFn: () => service.byStatistic(statId),
    enabled: enabled && !!statId,
  });
}

export function useMyStatisticFeedbackQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.statisticFeedback.mine,
    queryFn: () => service.mine(),
    enabled,
  });
}

export function useCreatorStatisticFeedbackQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.statisticFeedback.creatorMine,
    queryFn: () => service.creatorMine(),
    enabled,
  });
}

export function useCreateStatisticFeedbackMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ statisticId, text }: { statisticId: number; text: string }) =>
      service.create(statisticId, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.statisticFeedback.all }),
  });
}
