'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PointsBalance } from '@/types';

interface PointsBalanceCardProps {
  balance: PointsBalance;
  pointValue: number;
}

export function PointsBalanceCard({ balance, pointValue }: PointsBalanceCardProps) {
  const redeemableValue = (balance.currentBalance * pointValue).toFixed(2);

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
      <CardHeader>
        <CardTitle className="text-center text-gray-700">Current Points Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Large Balance Display */}
        <div className="text-center">
          <div className="text-5xl md:text-6xl font-bold text-orange-600">
            {balance.currentBalance.toLocaleString()}
          </div>
          <div className="text-lg text-gray-600 mt-2">
            Worth S$ {redeemableValue}
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-orange-200">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Earned</div>
            <div className="text-xl font-semibold text-green-600">
              {balance.totalEarned.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Redeemed</div>
            <div className="text-xl font-semibold text-orange-600">
              {balance.totalRedeemed.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Adjusted</div>
            <div className="text-xl font-semibold text-blue-600">
              {balance.totalAdjusted.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
