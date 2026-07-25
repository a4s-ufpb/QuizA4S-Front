import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TagService } from "../service/TagService";
import { queryKeys } from "./queryKeys";

const tagService = new TagService();

export function useMyTagsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.tags.mine,
    queryFn: () => tagService.listMine(),
    enabled,
  });
}

export function useAllTagsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.tags.everyone,
    queryFn: () => tagService.listAll(),
    enabled,
  });
}

export function useTagsByCreatorQuery(uuid: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.tags.byCreator(uuid),
    queryFn: () => tagService.listByCreator(uuid),
    enabled: enabled && !!uuid,
  });
}

export function useCreateTagMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => tagService.create(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tags.all }),
  });
}

export function useUpdateTagMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => tagService.update(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tags.all }),
  });
}

export function useDeleteTagMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tagService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tags.all });
      qc.invalidateQueries({ queryKey: queryKeys.themes.all });
    },
  });
}
