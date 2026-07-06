import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StoreService } from "../service/StoreService";
import { queryKeys } from "./queryKeys";

const storeService = new StoreService();

export function useStoreCatalogQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.store.items,
    queryFn: () => storeService.findCatalog(),
    enabled,
  });
}

export function usePurchaseItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemCode: string) => storeService.purchase(itemCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.store.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.me });
    },
  });
}

function persistEquip(user: { equippedTitle?: string | null; equippedFrame?: string | null; equippedBanner?: string | null }) {
  // Mantém o localStorage do usuário logado em dia com os cosméticos equipados.
  try {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.setItem("user", JSON.stringify({ ...stored, ...user }));
  } catch {
    /* ignore */
  }
}

export function useEquipItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemCode: string) => storeService.equip(itemCode),
    onSuccess: (res) => {
      if (res.success) persistEquip(res.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
    },
  });
}

export function useUnequipItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: string) => storeService.unequip(category),
    onSuccess: (res) => {
      if (res.success) persistEquip(res.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
    },
  });
}
