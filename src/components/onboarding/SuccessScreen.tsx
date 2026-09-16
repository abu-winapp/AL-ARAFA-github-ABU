'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';

interface SuccessScreenProps {
  onComplete?: () => void; // Optional callback for dialog mode
}

export function SuccessScreen({ onComplete }: SuccessScreenProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Defer callback to avoid updating parent during render
          setTimeout(() => {
            if (onComplete) {
              onComplete();
            } else {
              // Force a full page reload to ensure addresses are refreshed
              window.location.href = '/menu';
            }
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, onComplete]);

  const handleBrowseNow = () => {
    // Use callback if provided (dialog mode), otherwise redirect (page mode)
    if (onComplete) {
      onComplete();
    } else {
      // Force a full page reload to ensure addresses are refreshed
      window.location.href = '/menu';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <div className="max-w-md space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            You're All Set!
          </h1>
          <p className="text-lg text-gray-600">
            Your account is ready to go
          </p>
        </div>

        {/* Redirect Info */}
        <p className="text-gray-500">
          Redirecting to menu in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-green-600 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${((3 - countdown) / 3) * 100}%` }}
          />
        </div>

        {/* Call to Action */}
        <div className="pt-4">
          <Button
            onClick={handleBrowseNow}
            size="lg"
            className="w-full sm:w-auto px-8"
          >
            Browse Menu Now
          </Button>
        </div>
      </div>
    </div>
  );
}
