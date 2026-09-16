'use client';

import { Button } from '@/components/ui/Button';
import { TransactionItem } from './TransactionItem';
import type { PointsTransaction } from '@/types';

interface TransactionListProps {
  transactions: PointsTransaction[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export function TransactionList({
  transactions,
  currentPage,
  totalPages,
  isLoading,
  onPageChange
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading transactions...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <div className="text-gray-600">No transactions yet</div>
        <div className="text-sm text-gray-500 mt-2">
          Start earning points by placing orders!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Transaction Items */}
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
