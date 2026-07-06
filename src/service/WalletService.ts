import { BaseService } from "./BaseService";
import type { Page, WalletTransactionResponse } from "../types";

export class WalletService extends BaseService {
  findMyWallet() {
    return this.handleRequest<{ coins: number }>("get", "/wallet/me");
  }

  findMyTransactions(page = 0, size = 20) {
    return this.handleRequest<Page<WalletTransactionResponse>>(
      "get",
      `/wallet/transactions?page=${page}&size=${size}`
    );
  }
}
