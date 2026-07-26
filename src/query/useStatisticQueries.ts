import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StatisticService } from "../service/StatisticService";
import { queryKeys } from "./queryKeys";
import type { GameMode, StatisticRequest } from "../types";

const statisticService = new StatisticService();

export function useAllStatisticByCreatorQuery(
  page: number,
  creatorId: string,
  studentName: string,
  themeName: string,
  startDate: string,
  endDate: string,
  gameMode: GameMode | "",
  enabled = true,
  size?: number
) {
  return useQuery({
    queryKey: [
      ...queryKeys.statistics.byCreator(page, creatorId, studentName, themeName, startDate, endDate),
      gameMode,
      size ?? "",
    ],
    queryFn: () =>
      statisticService.findAllStatisticByCreator(
        page, creatorId, studentName, themeName, startDate, endDate, gameMode, size
      ),
    enabled: enabled && Boolean(creatorId),
  });
}

export function useAllStatisticByCreatorForChartQuery(
  creatorId: string,
  studentName: string,
  themeName: string,
  startDate: string,
  endDate: string,
  gameMode: GameMode | "",
  enabled = true
) {
  return useQuery({
    queryKey: [
      ...queryKeys.statistics.byCreatorChart(creatorId, studentName, themeName, startDate, endDate),
      gameMode,
    ],
    queryFn: () =>
      statisticService.findAllStatisticByCreatorForChart(
        creatorId, studentName, themeName, startDate, endDate, gameMode
      ),
    enabled: enabled && Boolean(creatorId),
  });
}

export function useDistinctThemeNameByCreatorIdQuery(
  creatorId: string,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.statistics.themeNamesByCreator(creatorId),
    queryFn: () => statisticService.findDistinctThemeNameByCreatorId(creatorId),
    enabled: enabled && Boolean(creatorId),
  });
}

export function useDistinctStudentNameByCreatorIdQuery(
  creatorId: string,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.statistics.studentNamesByCreator(creatorId),
    queryFn: () => statisticService.findDistinctStudentNameByCreatorId(creatorId),
    enabled: enabled && Boolean(creatorId),
  });
}

export function useInsertStatisticMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { statistic: StatisticRequest; studentUuid?: string }) =>
      statisticService.insertStatistic(payload.statistic, payload.studentUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.all });
    },
  });
}
