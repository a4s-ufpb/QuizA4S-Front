import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ThemeFeedbackService } from "../service/ThemeFeedbackService";
import { queryKeys } from "./queryKeys";

const service = new ThemeFeedbackService();

export function useThemeFeedbackByThemeQuery(themeId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.themeFeedback.byTheme(themeId),
    queryFn: () => service.listByTheme(themeId),
    enabled: enabled && !!themeId,
  });
}

export function useThemeFeedbackCountQuery(themeId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.themeFeedback.count(themeId),
    queryFn: () => service.count(themeId),
    enabled: enabled && !!themeId,
  });
}

export function useCreateThemeFeedbackMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ themeId, text }: { themeId: number; text: string }) =>
      service.create(themeId, text),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.themeFeedback.byTheme(vars.themeId) });
      qc.invalidateQueries({ queryKey: queryKeys.themeFeedback.count(vars.themeId) });
    },
  });
}
