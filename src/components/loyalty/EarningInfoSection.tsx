'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface EarningInfoSectionProps {
  pointsPerDollar: number;
  pointValue: number;
  minRedemption: number;
}

export function EarningInfoSection({
  pointsPerDollar,
  pointValue,
  minRedemption
}: EarningInfoSectionProps) {
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <InfoIcon className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-sm text-gray-700">
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Earning Rate:</span> Earn {pointsPerDollar} point{pointsPerDollar !== 1 ? 's' : ''} for every S$1 spent
          </div>
          <div>
            <span className="font-semibold">Redemption Value:</span> Each point is worth S$ {pointValue.toFixed(2)}
          </div>
          <div>
            <span className="font-semibold">Minimum Redemption:</span> {minRedemption.toLocaleString()} points required to redeem
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
