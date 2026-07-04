import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlternativeService } from "../service/AlternativeService";
import { queryKeys } from "./queryKeys";
import type { Alternative } from "../types";

const alternativeService = new AlternativeService();

// Alternativas não têm uma tela de listagem própria (sempre aparecem
// aninhadas na questão), então as mutações invalidam o cache de questões.
function invalidateQuestions(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });
}

export function useInsertAlternativeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      idQuestion,
      alternative,
    }: {
      idQuestion: number;
      alternative: Alternative;
    }) => alternativeService.insertAlternative(idQuestion, alternative),
    onSuccess: () => invalidateQuestions(queryClient),
  });
}

export function useInsertAllAlternativesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      idQuestion,
      alternatives,
    }: {
      idQuestion: number;
      alternatives: Alternative[];
    }) => alternativeService.insertAllAlternatives(idQuestion, alternatives),
    onSuccess: () => invalidateQuestions(queryClient),
  });
}

export function useUpdateAlternativeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      alternativeId,
      alternativeUpdate,
    }: {
      alternativeId: number;
      alternativeUpdate: Partial<Alternative>;
    }) => alternativeService.updateAlternative(alternativeId, alternativeUpdate),
    onSuccess: () => invalidateQuestions(queryClient),
  });
}

export function useRemoveAlternativeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alternativeId: number) =>
      alternativeService.removeAlternative(alternativeId),
    onSuccess: () => invalidateQuestions(queryClient),
  });
}
