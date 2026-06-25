import { apiClient } from "../api-client";

export type TransactionType = "All" | "Deposit" | "Withdraw" | "Convert";
export type TransactionStatus = "All" | "Success" | "Failed" | "Pending";

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  createdAt: string;
}

export const getTransactions = async (filters?: TransactionFilters): Promise<{
  data: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const params: Record<string, string> = {};

  if (filters) {
    if (filters.type && filters.type !== "All") params.type = filters.type;
    if (filters.status && filters.status !== "All") params.status = filters.status;
    if (filters.page) params.page = filters.page.toString();
    if (filters.limit) params.limit = filters.limit.toString();
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
  }

  return apiClient<{
    data: Transaction[];
    total: number;
    page: number;
    totalPages: number;
  }>("/transactions", { params });
};
