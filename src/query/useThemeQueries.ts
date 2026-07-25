import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ThemeService } from "../service/ThemeService";
import { queryKeys } from "./queryKeys";

const themeService = new ThemeService();

export function useAllThemesQuery(
  name: string,
  page: number,
  enabled = true,
  tagIds?: number[]
) {
  return useQuery({
    queryKey: queryKeys.themes.list(name, page, tagIds),
    queryFn: () => themeService.findAllThemes(name, page, tagIds),
    enabled,
  });
}

export function useThemesByCreatorQuery(
  name: string,
  page: number,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.themes.byCreator(name, page),
    queryFn: () => themeService.findThemesByCreator(name, page),
    enabled,
  });
}

export function useThemeByIdQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.themes.detail(id),
    queryFn: () => themeService.findThemeById(id),
    enabled,
  });
}

export function useInsertThemeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => themeService.insertTheme(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.themes.all });
    },
  });
}

export function useUpdateThemeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      themeId,
      formData,
    }: {
      themeId: number;
      formData: FormData;
    }) => themeService.updateTheme(themeId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.themes.all });
    },
  });
}

export function useRemoveThemeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (themeId: number) => themeService.removeTheme(themeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.themes.all });
    },
  });
}

export function useLikeThemeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (themeId: number) => themeService.likeTheme(themeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.themes.all });
    },
  });
}

export function useUnlikeThemeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (themeId: number) => themeService.unlikeTheme(themeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.themes.all });
    },
  });
}
