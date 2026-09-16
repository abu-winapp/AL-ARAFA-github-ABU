'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, Gift, Sparkles } from 'lucide-react';
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
  const maxPointsByAmount = Math.floor(maxRedeemableAmount / pointValue);
  const maxRedeemablePoints = Math.min(availablePoints, maxPointsByAmount);

  // Calculate discount value
  const pointsNum = parseInt(pointsToRedeem) || 0;
  const discountValue = Math.min(pointsNum * pointValue, maxRedeemableAmount);

  useEffect(() => {
    // Validate and update parent
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
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setPointsToRedeem(value);
    }
  };

  const handleMaxRedeem = () => {
    if (disabled) return;
    setPointsToRedeem(maxRedeemablePoints.toString());
  };

  // Check if redemption is available
  const canRedeem = availablePoints >= minRedemption && maxRedeemableAmount > 0;

  if (!canRedeem) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Loyalty Points
        </h2>
        <p className="text-sm text-text-secondary">
          {availablePoints < minRedemption
            ? `You need at least ${minRedemption} points to redeem. You currently have ${availablePoints} points.`
            : 'Points cannot be redeemed for this order.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Redeem Loyalty Points
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        You have <span className="font-semibold text-text-primary">{availablePoints}</span> points
        (worth <span className="font-semibold text-text-primary">S$ {(availablePoints * pointValue).toFixed(2)}</span>)
      </p>

      <div className="space-y-4">
        {/* Points Input */}
        <div className="space-y-2">
          <Label htmlFor="points-redeem" className="text-sm font-medium">
            Points to redeem
          </Label>
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
              className={`flex-1 ${error ? 'border-red-500' : ''}`}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleMaxRedeem}
              disabled={disabled}
              className="px-4 whitespace-nowrap"
            >
              Max
            </Button>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
          {!error && pointsNum > 0 && (
            <p className="text-sm text-green-700 font-medium">
              Discount: - S$ {discountValue.toFixed(2)}
            </p>
          )}
        </div>

        {/* Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-gray-600">Slide to redeem</Label>
            <span className="text-xs text-gray-500">
              {pointsNum > 0 ? `${Math.round((pointsNum / maxRedeemablePoints) * 100)}%` : '0%'}
            </span>
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
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>0 pts</span>
            <span>{maxRedeemablePoints} pts</span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-background-gray rounded-lg p-3 border border-border-light">
          <p className="text-xs text-text-secondary">
            <span className="font-medium">Note:</span> Maximum {maxRedeemablePoints} points
            (S$ {(maxRedeemablePoints * pointValue).toFixed(2)}) can be redeemed for this order.
            Minimum {minRedemption} points required.
          </p>
        </div>
      </div>
    </div>
  );
}
