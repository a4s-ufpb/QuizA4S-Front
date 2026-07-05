import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FriendshipService } from "../service/FriendshipService";
import { queryKeys } from "./queryKeys";

const friendshipService = new FriendshipService();

export function useMyFriendsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.friendship.mine,
    queryFn: () => friendshipService.findMyFriends(),
    enabled,
  });
}

export function usePendingFriendRequestsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.friendship.pending,
    queryFn: () => friendshipService.findPendingRequests(),
    enabled,
    refetchInterval: enabled ? 15000 : false,
  });
}

export function useRequestFriendshipMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) =>
      friendshipService.requestFriendship(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friendship.all });
    },
  });
}

export function useAcceptFriendshipMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendshipId: number) =>
      friendshipService.acceptFriendship(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friendship.all });
    },
  });
}

export function useRemoveFriendshipMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendshipId: number) =>
      friendshipService.removeFriendship(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friendship.all });
    },
  });
}
