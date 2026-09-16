'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Minus, Edit } from 'lucide-react';
import type { PointsTransaction } from '@/types';
import { cn } from '@/lib/utils';

interface TransactionItemProps {
  transaction: PointsTransaction;
}

const TYPE_CONFIG = {
  earned: {
    icon: Star,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    badgeVariant: 'default' as const,
    badgeClass: 'bg-green-100 text-green-700 border-green-200'
  },
  redeemed: {
    icon: Minus,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    badgeVariant: 'default' as const,
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  adjusted: {
    icon: Edit,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    badgeVariant: 'default' as const,
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200'
  }
};

export function TransactionItem({ transaction }: TransactionItemProps) {
  const config = TYPE_CONFIG[transaction.transactionType];
  const Icon = config.icon;
  const formattedDate = new Date(transaction.createdAt).toLocaleDateString('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const pointsDisplay = transaction.points >= 0
    ? `+${transaction.points.toLocaleString()}`
    : transaction.points.toLocaleString();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn('p-2 rounded-full', config.bgColor)}>
            <Icon className={cn('h-5 w-5', config.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={config.badgeClass}>
                  {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                </Badge>
                {transaction.orderNumber && (
                  <Link
                    href={`/orders/${transaction.orderId}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Order #{transaction.orderNumber}
                  </Link>
                )}
              </div>
              <div className="text-right whitespace-nowrap">
                <div className={cn('text-lg font-semibold', config.color)}>
                  {pointsDisplay}
                </div>
                <div className="text-xs text-gray-500">
                  Balance: {transaction.balanceAfter.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-700 mb-1">
              {transaction.description}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
              <span>{formattedDate}</span>
              {transaction.adjustedByName && (
                <>
                  <span>•</span>
                  <span>Adjusted by {transaction.adjustedByName}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
