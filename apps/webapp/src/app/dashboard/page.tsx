"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTransactions, Transaction } from "@/lib/api";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?redirect=dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchTransactions();
    }
  }, [token, isAuthenticated]);

  const fetchTransactions = async () => {
    if (!token) return;
    
    try {
      const response = await getUserTransactions(token);
      if (response.success && response.data && Array.isArray(response.data)) {
        const validTransactions = response.data.filter((transaction: Transaction) => 
          transaction && transaction.id && typeof transaction.coinsEarned === 'number'
        );
        setTransactions(validTransactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to load transaction history: ${errorMessage}`);
    } finally {
      setLoadingTransactions(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const totalCoins = user?.totalCoins || 0;
  const totalEarned = user?.totalEarned || 0;
  const totalRedeemed = user?.totalRedeemed || 0;

  return (
    <div className="font-sans bg-white min-h-screen">
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-up">
        <h1 className="text-3xl sm:text-4xl font-bold">
          Welcome, {user?.mobileNumber ? `+91${user.mobileNumber.slice(-4)}` : 'User'}!
        </h1>

        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold">{totalCoins}</div>
              <div className="text-amber-700 font-medium">Corra Coins</div>
            </div>
            <div className="text-black/60">{totalRedeemed} Redeemed</div>
          </div>
          <div className="mt-4 text-black/70">{totalEarned} Earned</div>
        </section>

        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="font-semibold">Transaction History</h2>
          {loadingTransactions ? (
            <div className="mt-4 text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="mt-4 text-center py-8 text-gray-500">
              <p>No transactions yet</p>
              <p className="text-sm">Start earning by uploading your first receipt!</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {transactions.map((transaction) => (
                <li key={transaction.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {transaction.coinsEarned > 0 ? 'Earned Coins' : 'Redeemed'}
                    </div>
                    <div className="text-black/60 text-sm">{transaction.brandName}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    {transaction.coinsEarned > 0 && (
                      <div className="text-green-700 font-semibold">+₹{transaction.coinsEarned}</div>
                    )}
                    {transaction.coinsRedeemed > 0 && (
                      <div className="text-rose-600 font-semibold">-₹{transaction.coinsRedeemed}</div>
                    )}
                    <div className="text-xs text-gray-500 capitalize">{transaction.status.toLowerCase()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-8">
          <button
            onClick={() => router.push('/rewards')}
            className="w-full h-12 rounded-xl bg-green-700 text-white font-medium hover:bg-green-800"
          >
            Get more rewards →
          </button>
        </div>
      </main>
    </div>
  );
}


