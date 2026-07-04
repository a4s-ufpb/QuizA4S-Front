import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ThemeService } from "../service/ThemeService";
import { queryKeys } from "./queryKeys";
import type { Theme } from "../types";

const themeService = new ThemeService();

export function useAllThemesQuery(name: string, page: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.themes.list(name, page),
    queryFn: () => themeService.findAllThemes(name, page),
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
    mutationFn: (theme: Partial<Theme>) => themeService.insertTheme(theme),
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
      themeUpdate,
    }: {
      themeId: number;
      themeUpdate: Partial<Theme>;
    }) => themeService.updateTheme(themeId, themeUpdate),
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
