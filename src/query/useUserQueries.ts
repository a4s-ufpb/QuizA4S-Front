import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService } from "../service/UserService";
import { queryKeys } from "./queryKeys";
import type { Role, User } from "../types";

const userService = new UserService();

// Consultas de usuário não são cacheadas: sempre refazem a chamada e não
// guardam o resultado, evitando exibir dados de sessão/permissão desatualizados
// (ex.: cargo, cosméticos, saldo) após uma troca de login.
const NO_CACHE = { staleTime: 0, gcTime: 0, refetchOnMount: "always" as const };

export function useFindUserQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: () => userService.findUser(),
    enabled,
    ...NO_CACHE,
  });
}

export function useRegisterUserMutation() {
  return useMutation({
    mutationFn: (user: unknown) => userService.registerUser(user),
  });
}

export function useLoginUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userLogin: unknown) => userService.loginUser(userLogin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useIsAdminQuery(userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.isAdmin(userId),
    queryFn: () => userService.validateIfUserIsAdmin(userId),
    enabled: enabled && Boolean(userId),
    ...NO_CACHE,
  });
}

export function usePublicProfileQuery(userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.publicProfile(userId),
    queryFn: () => userService.findPublicProfile(userId),
    enabled: enabled && Boolean(userId),
    ...NO_CACHE,
  });
}

export function useAllUsersQuery(
  userId: string,
  page: number,
  name: string,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.users.list(userId, page, name),
    queryFn: () => userService.findAllUsers(userId, page, name),
    enabled: enabled && Boolean(userId),
    ...NO_CACHE,
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      userUpdate,
    }: {
      userId: string;
      userUpdate: Partial<User>;
    }) => userService.updateUser(userId, userUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      userService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: ({
      userId,
      userPassword,
    }: {
      userId: string;
      userPassword: { newPassword: string; confirmNewPassword: string };
    }) => userService.updatePassword(userId, userPassword),
  });
}

export function useLikeUserMutation() {
  return useMutation({
    mutationFn: (targetUserId: string) => userService.likeUser(targetUserId),
  });
}

export function useRemoveUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin?: boolean }) =>
      userService.removeUser(userId, isAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
