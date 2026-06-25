"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { TransactionFilters } from "@/components/dashboard/transaction-filters";
import { Pagination } from "@/components/shared/pagination";
import { getTransactions, Transaction, TransactionFilters as APIFilters, TransactionType, TransactionStatus } from "@/lib/api/transactions";

function TransactionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilteredTransactions = async () => {
      setLoading(true);
      setError(null);
      
      const filters: APIFilters = {
        type: (searchParams.get("type") as TransactionType) || "All",
        status: (searchParams.get("status") as TransactionStatus) || "All",
        page: Number(searchParams.get("page")) || 1,
        limit: Number(searchParams.get("limit")) || 20,
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
      };

      try {
        const response = await getTransactions(filters);
        setTransactions(response.data || []);
        setTotal(response.total || 0);
        setCurrentPage(response.page || 1);
        setTotalPages(response.totalPages || 1);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch transactions";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredTransactions();
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Transactions</h1>
        <p className="text-muted-foreground">Manage and view your transaction history.</p>
      </div>

      <TransactionFilters />

      <div className="flex flex-col space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-8 border rounded-lg bg-card">
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-8 border border-red-200 bg-red-50 text-red-600 rounded-lg">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Showing {transactions.length} of {total} transactions
            </div>
            
            {/* Minimal list to satisfy displaying filtered data since UI wasn't provided */}
            <div className="border rounded-lg bg-card overflow-hidden">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No transactions found for the selected filters.
                </div>
              ) : (
                <ul className="divide-y border-t-0">
                  {transactions.map((tx) => (
                    <li key={tx.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-medium">{tx.type}</span>
                        <span className="text-sm text-muted-foreground">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Unknown Date'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">{tx.currency} {tx.amount}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full mt-1 ${
                          tx.status === 'Success' ? 'bg-green-100 text-green-700' :
                          tx.status === 'Failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {total > 0 && (
              <div className="pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col w-full max-w-6xl mx-auto space-y-6 p-8 items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <TransactionsContent />
    </Suspense>
  );
}
