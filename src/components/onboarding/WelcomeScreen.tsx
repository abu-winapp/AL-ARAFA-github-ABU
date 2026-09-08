'use client';

import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <div className="max-w-md space-y-6">
        {/* Welcome Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for choosing Al Arafa Restaurant
          </p>
        </div>

        {/* Brand Messaging */}
        <div className="space-y-4 text-gray-700">
          <p>
            We're excited to bring authentic flavors right to your doorstep.
          </p>
          <p>
            To get started, let's set up your delivery address so we can ensure
            your food arrives fresh and on time.
          </p>
        </div>

        {/* Call to Action */}
        <div className="pt-4">
          <Button
            onClick={onNext}
            size="lg"
            className="w-full sm:w-auto px-8"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
