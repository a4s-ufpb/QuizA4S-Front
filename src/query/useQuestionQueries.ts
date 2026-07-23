import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QuestionService } from "../service/QuestionService";
import { queryKeys } from "./queryKeys";
import type { Question } from "../types";

const questionService = new QuestionService();

export function useQuestionByIdQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.questions.detail(id),
    queryFn: () => questionService.findQuestionById(id),
    enabled: enabled && Boolean(id),
  });
}

export function useTop10QuestionsByThemeQuery(
  themeId: string | number,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.questions.byThemeTop10(themeId),
    queryFn: () => questionService.find10QuestionsByThemeId(themeId),
    enabled: enabled && Boolean(themeId),
  });
}

// Versão leve (imagens já são URLs do MinIO) usada pra jogar o quiz single-player.
export function useTop10QuestionsForPlayQuery(
  themeId: string | number,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.questions.byThemeTop10ForPlay(themeId),
    queryFn: () => questionService.find10QuestionsForPlay(themeId),
    enabled: enabled && Boolean(themeId),
  });
}

export function useQuestionsByCreatorQuery(
  themeId: number,
  page: number,
  title: string,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.questions.byCreator(themeId, page, title),
    queryFn: () => questionService.findQuestionsByCreator(themeId, page, title),
    enabled: enabled && Boolean(themeId),
  });
}

export function useTop10QuestionsByCreatorQuery(
  themeId: number,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.questions.byCreatorTop10(themeId),
    queryFn: () => questionService.find10QuestionsByThemeIdAndCreatorId(themeId),
    enabled: enabled && Boolean(themeId),
  });
}

export function useAllQuestionsByThemeQuery(themeId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.questions.byTheme(themeId),
    queryFn: () => questionService.findAllQuestionsByTheme(themeId),
    enabled: enabled && Boolean(themeId),
  });
}

function invalidateQuestions(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });
  // Estatísticas/temas dependem indiretamente de questões (ex: contagem).
  queryClient.invalidateQueries({ queryKey: queryKeys.themes.all });
}

export function useInsertQuestionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formData,
      idTheme,
    }: {
      formData: FormData;
      idTheme: number;
    }) => questionService.insertQuestion(formData, idTheme),
    onSuccess: () => invalidateQuestions(queryClient),
  });
}

export function useUpdateQuestionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      formData,
    }: {
      questionId: number;
      formData: FormData;
    }) => questionService.updateQuestion(questionId, formData),
    onSuccess: () => invalidateQuestions(queryClient),
  });
}

export function useRemoveQuestionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: number) => questionService.removeQuestion(questionId),
    onSuccess: () => invalidateQuestions(queryClient),
  });
}
