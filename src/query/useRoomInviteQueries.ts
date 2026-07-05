import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RoomInviteService } from "../service/RoomInviteService";
import { queryKeys } from "./queryKeys";

const roomInviteService = new RoomInviteService();

export function useMyRoomInviteQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.roomInvite.mine,
    queryFn: () => roomInviteService.findMyInvite(),
    enabled,
    refetchInterval: enabled ? 8000 : false,
  });
}

export function useSendRoomInviteMutation() {
  return useMutation({
    mutationFn: ({ targetId, roomCode }: { targetId: string; roomCode: string }) =>
      roomInviteService.sendInvite(targetId, roomCode),
  });
}

export function useDismissRoomInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => roomInviteService.dismissInvite(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roomInvite.mine });
    },
  });
}
