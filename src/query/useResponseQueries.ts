import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ResponseService } from "../service/ResponseService";
import { queryKeys } from "./queryKeys";
import type { GameMode } from "../types";

const responseService = new ResponseService();

export function useResponsesByUserQuery(page: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.responses.byUser(page),
    queryFn: () => responseService.findResponsesByUser(page),
    enabled,
  });
}

export function useMyResponsesQuery(
  page: number,
  theme: string,
  startDate: string,
  endDate: string,
  gameMode: GameMode,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.responses.myResponses(
      page,
      theme,
      startDate,
      endDate,
      gameMode
    ),
    queryFn: () =>
      responseService.findMyResponses(page, theme, startDate, endDate, gameMode),
    enabled,
  });
}

export function useMySummaryQuery(
  theme: string,
  startDate: string,
  endDate: string,
  gameMode: GameMode,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.responses.mySummary(theme, startDate, endDate, gameMode),
    queryFn: () =>
      responseService.findMySummary(theme, startDate, endDate, gameMode),
    enabled,
  });
}

export function useResponsesByQuestionCreatorQuery(
  page: number,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.responses.byQuestionCreator(page),
    queryFn: () => responseService.findResponsesByQuestionCreator(page),
    enabled,
  });
}

export function useResponsesQueryFilterQuery(
  page: number,
  username: string,
  theme: string,
  currentDate: string,
  finalDate: string,
  gameMode: GameMode,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.responses.query(
      page,
      username,
      theme,
      currentDate,
      finalDate,
      gameMode
    ),
    queryFn: () =>
      responseService.findResponsesByQuestionCreatorAndUsernameAndDateAndThemeName(
        page,
        username,
        theme,
        currentDate,
        finalDate,
        gameMode
      ),
    enabled,
  });
}

export function useResponsesQueryChartQuery(
  username: string,
  theme: string,
  currentDate: string,
  finalDate: string,
  gameMode: GameMode,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.responses.queryChart(
      username,
      theme,
      currentDate,
      finalDate,
      gameMode
    ),
    queryFn: () =>
      responseService.findResponsesByQuestionCreatorAndUsernameAndDateAndThemeNameForChart(
        username,
        theme,
        currentDate,
        finalDate,
        gameMode
      ),
    enabled,
  });
}

export function useResponsesStatisticsQuery(
  themeName: string,
  userId: string,
  gameMode: GameMode,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.responses.statistics(themeName, userId, gameMode),
    queryFn: () =>
      responseService.findResponsesStatistics(themeName, userId, gameMode),
    enabled: enabled && Boolean(themeName),
  });
}

export function useUsernamesByCreatorQuery(creatorId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.responses.usernamesByCreator(creatorId),
    queryFn: () => responseService.findUsernamesByCreator(creatorId),
    enabled: enabled && Boolean(creatorId),
  });
}

export function useThemeNamesByCreatorQuery(creatorId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.responses.themeNamesByCreator(creatorId),
    queryFn: () => responseService.findThemeNamesByCreator(creatorId),
    enabled: enabled && Boolean(creatorId),
  });
}

function invalidateResponses(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.responses.all });
}

export function useInsertResponseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      idUser,
      idQuestion,
      idAlternative,
    }: {
      idUser: string;
      idQuestion: number;
      idAlternative: number;
    }) => responseService.insertResponse(idUser, idQuestion, idAlternative),
    onSuccess: () => invalidateResponses(queryClient),
  });
}

export function useInsertMultiplayerResponsesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { questionId: number; alternativeId: number }[]) =>
      responseService.insertMultiplayerResponses(items),
    onSuccess: () => invalidateResponses(queryClient),
  });
}

export function useRemoveResponseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (responseId: number) =>
      responseService.removeResponse(responseId),
    onSuccess: () => invalidateResponses(queryClient),
  });
}
