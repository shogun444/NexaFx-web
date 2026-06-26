import { apiClient } from "@/lib/api-client";

export type TransactionType = "Deposit" | "Withdraw" | "Convert";
export type TransactionStatus = "Success" | "Failed" | "Pending";

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  amountString: string;
  toAmount?: number;
  toCurrency?: string;
  createdAt: string;
  reference: string;
  description?: string;
  fee?: number;
  exchangeRate?: number;
  walletAddress?: string;
}

export interface TransactionQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  from?: string;
  to?: string;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
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

  let amountString = `${amount.toLocaleString()} ${currency}`;
  if (type === "Deposit") amountString = `+ ${amountString}`;
  else if (type === "Withdraw") amountString = `- ${amountString}`;

  const toAmount = type === "Convert" ? (Number(dto.toAmount ?? dto.to_amount) || undefined) : undefined;
  const toCurrency = type === "Convert" ? ((dto.toCurrency ?? dto.to_currency) as string | undefined) : undefined;
  const createdAt = (dto.createdAt ?? dto.date ?? dto.created_at ?? new Date().toISOString()) as string;

  return {
    id: (dto.id ?? dto._id) as string,
    type,
    status,
    amount,
    currency,
    amountString,
    toAmount,
    toCurrency,
    createdAt,
    reference: (dto.reference ?? dto.transactionRef ?? dto.transaction_ref ?? "") as string,
    description: dto.description as string | undefined,
    fee: dto.fee as number | undefined,
    exchangeRate: (dto.exchangeRate ?? dto.exchange_rate) as number | undefined,
    walletAddress: (dto.walletAddress ?? dto.wallet_address ?? dto.fromWallet) as string | undefined,
  };
}

export async function getTransactions(
  query: TransactionQueryDto = {}
): Promise<PaginatedTransactions> {
  const params: Record<string, string> = {};
  if (query.page) params.page = String(query.page);
  if (query.limit) params.limit = String(query.limit);
  if (query.search) params.search = query.search;
  if (query.type && query.type !== "All") {
    const typeParam = query.type === "Withdraw" ? "withdrawal" : query.type.toLowerCase();
    params.type = typeParam;
  }
  if (query.from) params.from = query.from;
  if (query.to) params.to = query.to;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await apiClient<any>("/transactions", { params });

  if (Array.isArray(json)) {
    return {
      data: json.map(mapTransaction),
      total: json.length,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (json.data ?? json.transactions ?? json.items ?? []) as Record<string, any>[];
  const total = (json.total ?? json.totalCount ?? json.count ?? data.length) as number;
  const page = (json.page ?? query.page ?? 1) as number;
  const limit = (json.limit ?? query.limit ?? 10) as number;

  return { data: data.map(mapTransaction), total, page, limit };
}

export async function getTransactionById(id: string): Promise<Transaction> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await apiClient<any>(`/transactions/${id}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dto = (json.data ?? json) as Record<string, any>;
  return mapTransaction(dto);
}