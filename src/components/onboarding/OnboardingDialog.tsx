"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { FulfillmentTypeScreen } from "./FulfillmentTypeScreen";
import { AddressSetupScreen } from "./AddressSetupScreen";
import { SuccessScreen } from "./SuccessScreen";

// import { useAuthStore } from "@/lib/store/useAuthStore";

import { useSettingsStore } from "@/lib/store/useSettingsStore";

type OnboardingStep = "fulfillment" | "address" | "success";

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function OnboardingDialog({
  open,
  onOpenChange,
  onComplete,
}: OnboardingDialogProps) {
  // const user = useAuthStore((state) => state.user);

  // Get settings helpers from Zustand
  const fetchAllSettings = useSettingsStore((state) => state.fetchAllSettings);

  const getHomeDeliveryEnabled = useSettingsStore(
    (state) => state.getHomeDeliveryEnabled,
  );

  const getPickupEnabled = useSettingsStore((state) => state.getPickupEnabled);

  const [currentStep, setCurrentStep] = useState<OnboardingStep>("fulfillment");

  const [selectedFulfillment, setSelectedFulfillment] = useState<
    "delivery" | "pickup" | null
  >(null);

  // Fetch settings when onboarding opens
  useEffect(() => {
    if (open) {
      fetchAllSettings();
    }
  }, [open, fetchAllSettings]);

  // Read API values
  // Read fulfillment availability using Zustand helpers
  const homeDeliveryAvailable = getHomeDeliveryEnabled();
  const pickFromStoreAvailable = getPickupEnabled();

  console.log("Fulfillment availability:", {
    homeDeliveryAvailable,
    pickFromStoreAvailable,
  });

  const handleSelectDelivery = () => {
    setSelectedFulfillment("delivery");
    setCurrentStep("address");
  };

  const handleSelectPickup = () => {
    setSelectedFulfillment("pickup");
    setCurrentStep("success");
  };

  const handleAddressNext = () => {
    setCurrentStep("success");
  };

  const handleAddressSkip = () => {
    setCurrentStep("success");
  };

  const handleSuccessComplete = () => {
    onOpenChange(false);

    if (onComplete) {
      onComplete();
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(() => {
        setCurrentStep("fulfillment");
        setSelectedFulfillment(null);
      }, 300);
    }

    onOpenChange(isOpen);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "fulfillment":
        return "Choose Fulfillment Method";

      case "address":
        return "Add Your First Delivery Address";

      case "success":
        return "Onboarding Complete";

      default:
        return "Account Setup";
    }
  };

  const getProgressSteps = () => {
    if (selectedFulfillment === "pickup") {
      return [
        {
          label: "Preference",
          completed: currentStep === "success",
          current: currentStep === "fulfillment",
        },
        {
          label: "Done",
          completed: false,
          current: currentStep === "success",
        },
      ];
    }

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
      {
        label: "Done",
        completed: false,
        current: currentStep === "success",
      },
    ];
  };

  const progressSteps = getProgressSteps();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">{getStepTitle()}</DialogTitle>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2">
            {progressSteps.map((step, index) => (
              <div key={index} className="flex items-center">
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

                {index < progressSteps.length - 1 && (
                  <div className="w-8 sm:w-12 h-0.5 bg-gray-300 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fulfillment Step */}
        {currentStep === "fulfillment" && (
          <FulfillmentTypeScreen
            onSelectDelivery={handleSelectDelivery}
            onSelectPickup={handleSelectPickup}
            homeDeliveryAvailable={homeDeliveryAvailable}
            pickFromStoreAvailable={pickFromStoreAvailable}
          />
        )}

        {/* Address Step */}
        {currentStep === "address" && (
          <AddressSetupScreen
            onNext={handleAddressNext}
            onSkip={handleAddressSkip}
          />
        )}

        {/* Success Step */}
        {currentStep === "success" && (
          <SuccessScreen onComplete={handleSuccessComplete} />
        )}
      </DialogContent>
    </Dialog>
  );
}
