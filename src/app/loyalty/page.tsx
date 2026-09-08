/**
 * Al-Arafa Restaurant - Loyalty Points Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PointsBalanceCard } from '@/components/loyalty/PointsBalanceCard';
import { EarningInfoSection } from '@/components/loyalty/EarningInfoSection';
import { TransactionList } from '@/components/loyalty/TransactionList';
import type { PointsBalance, PointsTransaction } from '@/types';
import * as loyaltyService from '@/lib/api/loyalty.service';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useSettingsStore } from '@/lib/store/useSettingsStore';

export default function LoyaltyPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  const { isAuthenticated, isInitialized, initialize } = useAuthStore();
  const { fetchLoyaltySettings, getPointsPerDollar, getPointValue, getMinRedemption } = useSettingsStore();

  // Initialize auth store on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Fetch loyalty settings on mount
  useEffect(() => {
    fetchLoyaltySettings();
  }, [fetchLoyaltySettings]);

  // Handle authentication and load balance
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login?redirect=/loyalty');
      return;
    }

    loadPointsBalance();
  }, [isAuthenticated, isInitialized, router]);

  // Load transaction history when page changes or after balance loads
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) {
      return;
    }

    loadTransactionHistory();
  }, [currentPage, isInitialized, isAuthenticated]);

  const loadPointsBalance = async () => {
    try {
      setIsLoadingBalance(true);
      setError(null);
      const data = await loyaltyService.getPointsBalance();
      setBalance(data);
    } catch (err) {
      console.error('Failed to load points balance:', err);
      setError('Failed to load points balance. Please try again.');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const loadTransactionHistory = async () => {
    try {
      setIsLoadingHistory(true);
      setError(null);
      const response = await loyaltyService.getPointsHistory(currentPage, pageSize);
      setTransactions(response.transactions);
      setTotalPages(Math.ceil(response.total / response.size));
    } catch (err) {
      console.error('Failed to load transaction history:', err);
      setError('Failed to load transaction history. Please try again.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Show loading state while initializing or loading balance
  if (!isInitialized || isLoadingBalance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your rewards...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !balance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              loadPointsBalance();
              loadTransactionHistory();
            }}
            className="text-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Rewards</h1>
          <p className="text-gray-600">
            Earn points with every order and redeem them for discounts
          </p>
        </div>

        {/* Points Balance Card */}
        {balance && (
          <div className="mb-6">
            <PointsBalanceCard
              balance={balance}
              pointValue={getPointValue()}
            />
          </div>
        )}

        {/* Earning Info */}
        <div className="mb-8">
          <EarningInfoSection
            pointsPerDollar={getPointsPerDollar()}
            pointValue={getPointValue()}
            minRedemption={getMinRedemption()}
          />
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h2>
          <TransactionList
            transactions={transactions}
            currentPage={currentPage}
            totalPages={totalPages}
            isLoading={isLoadingHistory}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
