import { useQuery } from "@tanstack/react-query";
import { WalletService } from "../service/WalletService";
import { queryKeys } from "./queryKeys";

const walletService = new WalletService();

export function useWalletQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.wallet.me,
    queryFn: () => walletService.findMyWallet(),
    enabled,
  });
}

export function useWalletTransactionsQuery(page = 0, enabled = true) {
  return useQuery({
    queryKey: queryKeys.wallet.transactions(page),
    queryFn: () => walletService.findMyTransactions(page),
    enabled,
  });
}
