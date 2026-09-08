"use client";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { FulfillmentTypeScreen } from "@/components/onboarding/FulfillmentTypeScreen";
import { AddressSetupScreen } from "@/components/onboarding/AddressSetupScreen";
import { SuccessScreen } from "@/components/onboarding/SuccessScreen";

type OnboardingStep = "fulfillment" | "address" | "success";

export default function OnboardingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("fulfillment");
  const [selectedFulfillment, setSelectedFulfillment] = useState<
    "delivery" | "pickup" | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/onboarding");
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  const handleSelectDelivery = () => {
    setSelectedFulfillment("delivery");
    setCurrentStep("address");
  };

  const handleSelectPickup = () => {
    setSelectedFulfillment("pickup");
    // Skip address for pickup and go to success
    setCurrentStep("success");
  };

  const handleAddressNext = () => {
    setCurrentStep("success");
  };

  const handleAddressSkip = () => {
    // Skip address setup and go directly to menu
    router.push("/menu");
  };

  // Calculate progress based on selected fulfillment type
  const getProgressSteps = () => {
    if (selectedFulfillment === "pickup") {
      // For pickup: Fulfillment → Success (2 steps)
      return [
        {
          label: "Preference",
          completed: currentStep === "success",
          current: currentStep === "fulfillment",
        },
        { label: "Done", completed: false, current: currentStep === "success" },
      ];
    } else {
      // For delivery: Fulfillment → Address → Success (3 steps)
      return [
        {
          label: "Preference",
          completed: currentStep === "address" || currentStep === "success",
          current: currentStep === "fulfillment",
        },
        {
          label: "Address",
          completed: currentStep === "success",
          current: currentStep === "address",
        },
        { label: "Done", completed: false, current: currentStep === "success" },
      ];
    }
  };

  const progressSteps = getProgressSteps();
  const settings = useSettingsStore((state) => state.settings);
  const fetchAllSettings = useSettingsStore((state) => state.fetchAllSettings);
  useEffect(() => {
    fetchAllSettings();
  }, [fetchAllSettings]);
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            {progressSteps.map((step, index) => (
              <div key={index} className="flex items-center">
                {/* Step Circle */}
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.current
                        ? "bg-primary text-white"
                        : step.completed
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step.completed ? "✓" : index + 1}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900 hidden sm:inline">
                    {step.label}
                  </span>
                </div>

                {/* Divider (except for last step) */}
                {index < progressSteps.length - 1 && (
                  <div className="w-12 h-0.5 bg-gray-300 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {currentStep === "fulfillment" && (
          <FulfillmentTypeScreen
            onSelectDelivery={handleSelectDelivery}
            onSelectPickup={handleSelectPickup}
            homeDeliveryAvailable={settings?.delivery?.home_delivery ?? false}
            pickFromStoreAvailable={
              settings?.delivery?.pick_from_store ?? false
            }
          />
        )}
        {currentStep === "address" && (
          <AddressSetupScreen
            onNext={handleAddressNext}
            onSkip={handleAddressSkip}
          />
        )}
        {currentStep === "success" && <SuccessScreen />}
      </div>
    </div>
  );
}
