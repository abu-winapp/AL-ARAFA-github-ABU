"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/useAuthStore";
import * as authService from "@/lib/api/auth.service";
import * as addressService from "@/lib/api/address.service";
import { OnboardingDialog } from "@/components/onboarding/OnboardingDialog";

type LoginStep = "email" | "otp";

interface EmailFormData {
  email: string;
}

interface OTPFormData {
  otp: string;
}

interface LoginSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectTo?: string;
  onLoginSuccess?: () => void; // Optional callback after successful login
}

export function LoginSheet({
  open,
  onOpenChange,
  redirectTo = "/menu",
  onLoginSuccess,
}: LoginSheetProps) {
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const emailForm = useForm<EmailFormData>();
  const otpForm = useForm<OTPFormData>();

  //checking user name and number in response and storing in local storage

  // const handleLoginSuccess = (userData: { name: string; phone: string }) => {

  //   const name = userData.name?.trim() || "";
  //   const phone = userData.phone?.trim() || "";

  //   const profileComplete = name !== "" && phone !== "";

  //   localStorage.setItem("userName", userData.name);
  //   localStorage.setItem("userPhone", userData.phone);
  //   localStorage.setItem("profileComplete", profileComplete.toString());

  //   //condition for redirecting user to profile page if profile is not complete
  //   if (!profileComplete) {
  //     router.push("/profile");
  //   }
  //   // If profile is complete, proceed with the normal flow
  //   else {
  //     {
  //       router.push("/menu");
  //     }
  //   }
  // };

  const handleLoginSuccess = (userData: { name?: string; phone?: string }) => {
    const name = userData.name?.trim() || "";
    const phone = userData.phone?.trim() || "";

    const profileComplete = name !== "" && phone !== "";

    localStorage.setItem("userName", name);
    localStorage.setItem("userPhone", phone);
    localStorage.setItem("profileComplete", profileComplete.toString());

    return profileComplete;
  };

  // Reset state when sheet closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setStep("email");
      setOtpSent(false);
      emailForm.reset();
      otpForm.reset();
      clearError();
    }
    onOpenChange(isOpen);
  };

  // Handle email submission
  const handleEmailSubmit = async (data: EmailFormData) => {
    try {
      clearError();
      setIsRequestingOTP(true);

      const trimmedEmail = data.email.trim().toLowerCase();
      await authService.requestOTP(trimmedEmail);
      setEmail(trimmedEmail);
      setOtpSent(true);
      setStep("otp");
    } catch (error) {
      emailForm.setError("email", {
        message: error instanceof Error ? error.message : "Failed to send OTP",
      });
    } finally {
      setIsRequestingOTP(false);
    }
  };

  // Handle OTP verification
  const handleOTPSubmit = async (data: OTPFormData) => {
    try {
      clearError();
      // await login(email, data.otp);
      const authResponse = await login(email, data.otp);

      const profileComplete = handleLoginSuccess(authResponse.user);

      onOpenChange(false);

      // Notify other components that login succeeded so they can retry pending actions
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new CustomEvent('salem:loginSuccess'));
        } catch (e) {
          // ignore
        }
      }

      // Detect first-time users by checking if they have any addresses
      try {
        const addresses = await addressService.getAddresses();
        const isFirstTime = !addresses || addresses.length === 0;
        if (!profileComplete) {
          // Preserve where the user was headed so /profile can send them
          // back there (Menu or Cart) once their profile is complete.
          router.push(
            `/profile?showOnboarding=1&redirect=${encodeURIComponent(redirectTo)}`,
          );
          return;
        }

        // First-time users ALWAYS see onboarding dialog
        if (isFirstTime) {
          setShowOnboarding(true);
        } else {
          // Returning users: use callback if provided, otherwise redirect
          if (onLoginSuccess) {
            onLoginSuccess();
          } else {
            router.push(redirectTo);
          }
        }
      } catch (addressError) {
        // If address check fails, fall back to default behavior
        console.error("Failed to check addresses:", addressError);
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          router.push(redirectTo);
        }
      }
    } catch (error) {
      otpForm.setError("otp", {
        message: error instanceof Error ? error.message : "Invalid OTP",
      });
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      clearError();
      setIsRequestingOTP(true);
      await authService.requestOTP(email);
      setOtpSent(true);
      otpForm.reset();
    } catch (error) {
      otpForm.setError("otp", {
        message:
          error instanceof Error ? error.message : "Failed to resend OTP",
      });
    } finally {
      setIsRequestingOTP(false);
    }
  };

  // Go back to email step
  const handleBackToEmail = () => {
    setStep("email");
    setOtpSent(false);
    otpForm.reset();
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    // After onboarding, redirect to menu or use callback
    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      router.push(redirectTo);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <img
                src="/logo.png"
                alt="Al Arafa Restaurant"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            </div>
            <SheetTitle className="text-2xl text-center">
              {step === "email" ? "Welcome!" : "Enter OTP"}
            </SheetTitle>
            <SheetDescription className="text-center">
              {step === "email"
                ? "Enter your email address to get started"
                : `We've sent a 6-digit code to ${email}`}
            </SheetDescription>
          </SheetHeader>

          {step === "email" ? (
            <form
              onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className={
                    emailForm.formState.errors.email ? "border-destructive" : ""
                  }
                  {...emailForm.register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                  disabled={isRequestingOTP}
                  autoFocus
                />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isRequestingOTP}
              >
                {isRequestingOTP ? "Sending OTP..." : "Continue"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By continuing, you agree to our Terms & Conditions and Privacy
                Policy
              </p>
            </form>
          ) : (
            <>
              <button
                onClick={handleBackToEmail}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="text-sm font-medium">Change email</span>
              </button>

              <form
                onSubmit={otpForm.handleSubmit(handleOTPSubmit)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    className={
                      otpForm.formState.errors.otp || error
                        ? "border-destructive"
                        : ""
                    }
                    {...otpForm.register("otp", {
                      required: "OTP is required",
                      pattern: {
                        value: /^\d{6}$/,
                        message: "OTP must be 6 digits",
                      },
                    })}
                    disabled={isLoading}
                    autoFocus
                  />
                  {(otpForm.formState.errors.otp || error) && (
                    <p className="text-sm text-destructive">
                      {otpForm.formState.errors.otp?.message || error}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify & Login"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isRequestingOTP}
                    className="text-primary hover:text-primary/80 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRequestingOTP
                      ? "Sending..."
                      : "Didn't receive? Resend OTP"}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <a
                href="tel:+6589896289"
                className="text-primary hover:text-primary/80 font-semibold"
              >
                Call +65 8989 6289
              </a>
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Onboarding Dialog for First-Time Users */}
      <OnboardingDialog
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
}
