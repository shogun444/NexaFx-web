import { apiClient } from "@/lib/api-client";

export type TransactionType = "Deposit" | "Withdraw" | "Convert";
export type TransactionStatus = "Success" | "Failed" | "Pending";

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  toAmount?: number;       // only present for Convert transactions
  toCurrency?: string;     // only present for Convert transactions
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTransaction(dto: Record<string, any>): Transaction {
  const typeMap: Record<string, TransactionType> = {
    deposit: "Deposit",
    withdrawal: "Withdraw",
    withdraw: "Withdraw",
    convert: "Convert",
    conversion: "Convert",
    exchange: "Convert",
  };
  const statusMap: Record<string, TransactionStatus> = {
    success: "Success",
    pending: "Pending",
    failed: "Failed",
  };

  const type = typeMap[(dto.type as string)?.toLowerCase()] ?? (dto.type as TransactionType);
  const status = statusMap[(dto.status as string)?.toLowerCase()] ?? (dto.status as TransactionStatus);
  const amount = Number(dto.amount) || 0;
  const currency = (dto.currency as string) ?? "";

  const toAmount = type === "Convert" ? (Number(dto.toAmount ?? dto.to_amount) || undefined) : undefined;
  const toCurrency = type === "Convert" ? ((dto.toCurrency ?? dto.to_currency) as string | undefined) : undefined;
  const createdAt = (dto.createdAt ?? dto.date ?? dto.created_at ?? new Date().toISOString()) as string;

  return {
    id: (dto.id ?? dto._id) as string,
    type,
    status,
    amount,
    currency,
    toAmount,
    toCurrency,
    createdAt,
  };
}

export const getTransactions = async (): Promise<Transaction[]> => {
  const json = await apiClient<unknown>("/transactions");

  let rawData: unknown[] = [];
  if (Array.isArray(json)) {
    rawData = json;
  } else if (json && typeof json === "object" && json !== null) {
    const obj = json as Record<string, unknown>;
    rawData = (obj.data ?? obj.transactions ?? obj.items ?? []) as unknown[];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawData.map((dto) => mapTransaction(dto as Record<string, any>));
};
