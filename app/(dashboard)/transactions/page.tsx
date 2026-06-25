"use client";

import { useEffect, useState } from "react";
import { Transaction, getTransactions } from "@/lib/api/transactions";
import { TransactionTable } from "@/components/dashboard/transaction-table";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchTx = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTransactions();
        if (!cancelled) {
          setTransactions(data);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load transactions");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchTx();

    return () => {
      cancelled = true;
    };
  }, [retryTrigger]);

  return (
    <div className="flex flex-col h-full space-y-6 max-w-7xl mx-auto w-full p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Transaction History</h1>
      </div>

      <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border/50">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-12 bg-muted/30 border-b border-border rounded-t-md" />
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="h-4 w-20 bg-muted rounded" />
                  </div>
                  <div className="h-4 w-12 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-6 w-16 bg-muted rounded-full" />
                  <div className="h-4 w-20 bg-muted rounded ml-auto" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setRetryTrigger((prev) => prev + 1);
              }}
              className="text-sm font-medium text-primary hover:underline px-4 py-2 border rounded-md"
            >
              Retry
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4 min-h-[400px] border rounded-lg bg-card">
            <p className="text-lg font-medium text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <TransactionTable transactions={transactions} />
        )}
      </div>
    </div>
  );
}
