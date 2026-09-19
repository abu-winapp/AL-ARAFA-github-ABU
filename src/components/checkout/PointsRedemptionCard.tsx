'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, Sparkles } from 'lucide-react';
import { useSettingsStore } from '@/lib/store/useSettingsStore';

interface PointsRedemptionCardProps {
  availablePoints: number;
  maxRedeemableAmount: number; // Max SGD that can be discounted (pre-GST total)
  onPointsChange: (points: number, discount: number) => void;
  disabled?: boolean;
}

export default function PointsRedemptionCard({
  availablePoints,
  maxRedeemableAmount,
  onPointsChange,
  disabled = false,
}: PointsRedemptionCardProps) {
  const [pointsToRedeem, setPointsToRedeem] = useState<string>('0');
  const [error, setError] = useState<string>('');

  const { getPointValue, getMinRedemption } = useSettingsStore();
  const pointValue = getPointValue(); // SGD per point
  const minRedemption = getMinRedemption(); // Minimum points to redeem

  // Calculate max points that can be redeemed
  const maxPointsByAmount = Math.floor(maxRedeemableAmount / (pointValue || 1));
  const maxRedeemablePoints = Math.min(availablePoints, maxPointsByAmount);

  // Calculate discount value
  const pointsNum = parseInt(pointsToRedeem) || 0;
  const discountValue = Math.min(pointsNum * pointValue, maxRedeemableAmount);

  useEffect(() => {
    const points = parseInt(pointsToRedeem) || 0;

    if (points === 0) {
      setError('');
      onPointsChange(0, 0);
      return;
    }

    if (points < minRedemption) {
      setError(`Minimum ${minRedemption} points required to redeem`);
      onPointsChange(0, 0);
      return;
    }

    if (points > availablePoints) {
      setError(`You only have ${availablePoints} points available`);
      onPointsChange(0, 0);
      return;
    }

    if (points > maxRedeemablePoints) {
      setError(`Maximum ${maxRedeemablePoints} points can be redeemed for this order`);
      onPointsChange(0, 0);
      return;
    }

    setError('');
    const discount = Math.min(points * pointValue, maxRedeemableAmount);
    onPointsChange(points, discount);
  }, [pointsToRedeem, availablePoints, maxRedeemableAmount, minRedemption, pointValue, maxRedeemablePoints, onPointsChange]);

  const handleSliderChange = (value: number[]) => {
    if (disabled) return;
    setPointsToRedeem(value[0].toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPointsToRedeem(value);
    }
  };

  const handleMaxRedeem = () => {
    if (disabled) return;
    setPointsToRedeem(maxRedeemablePoints.toString());
  };

  const canRedeem = availablePoints >= minRedemption && maxRedeemableAmount > 0;

  if (!canRedeem) {
    return (
      <div className="bg-[#FFFFFF] border border-[#EAE2D5] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#FAF3E0] text-[#B88E34] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-base text-[#1C1613]">
            Loyalty Points
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[#8E8279] pl-10">
          {availablePoints < minRedemption
            ? `You have ${availablePoints} points. At least ${minRedemption} points are required to redeem discounts.`
            : 'Loyalty points cannot be applied to this order.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#EAE2D5] rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FAF3E0] text-[#B88E34] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#1C1613]">
              Redeem Loyalty Points
            </h3>
            <p className="text-xs text-[#8E8279] mt-0.5">
              Available: <span className="font-semibold text-[#1C1613]">{availablePoints} pts</span>
              {' • '}
              Worth <span className="font-semibold text-[#2D6A4F]">S$ {(availablePoints * pointValue).toFixed(2)}</span>
            </p>
          </div>
        </div>

        {pointsNum > 0 && !error && (
          <span className="text-xs font-bold text-[#2D6A4F] bg-[#E8F5EE] px-2.5 py-1 rounded-full border border-[#C5E8D4] shrink-0">
            - S$ {discountValue.toFixed(2)}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Points Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-[#5C524B]">
            <Label htmlFor="points-redeem" className="text-xs font-medium">
              Points to Redeem
            </Label>
            <span className="text-[11px] text-[#8E8279]">
              Max: {maxRedeemablePoints} pts
            </span>
          </div>

          <div className="flex gap-2">
            <Input
              id="points-redeem"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pointsToRedeem}
              onChange={handleInputChange}
              disabled={disabled}
              placeholder="0"
              className={`flex-1 text-sm ${error ? 'border-[#B3261E] focus-visible:ring-[#B3261E]' : ''}`}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleMaxRedeem}
              disabled={disabled}
              className="px-4 whitespace-nowrap text-xs font-semibold border-[#D0C6B8] hover:border-[#95221C] hover:text-[#95221C]"
            >
              Use Max
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-[#B3261E]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Slider */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-[#8E8279]">
            <span>Slide to adjust</span>
            <span>{pointsNum > 0 ? `${Math.round((pointsNum / maxRedeemablePoints) * 100)}%` : '0%'}</span>
          </div>
          <Slider
            value={[pointsNum]}
            onValueChange={handleSliderChange}
            max={maxRedeemablePoints}
            min={0}
            step={Math.max(1, Math.floor(maxRedeemablePoints / 100))}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex items-center justify-between text-[11px] text-[#8E8279]">
            <span>0</span>
            <span>{maxRedeemablePoints} pts</span>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-[#FAF7F2] rounded-xl p-3 border border-[#EAE2D5] text-[11px] text-[#5C524B] leading-relaxed">
          <span className="font-semibold text-[#1C1613]">Reward Note: </span>
          Redeem up to {maxRedeemablePoints} points for a S$ {(maxRedeemablePoints * pointValue).toFixed(2)} discount. Minimum redemption is {minRedemption} points.
        </div>
      </div>
    </div>
  );
}
