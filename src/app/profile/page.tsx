"use client";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { OnboardingDialog } from "@/components/onboarding/OnboardingDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/lib/hooks/use-toast";
import { uploadProfileImage } from "@/lib/api/upload.service";
import { getProfile, updateProfile } from "@/lib/api/profile.service";

interface ProfileFormData {
  name?: string;
  phone?: string;
}

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, isAuthenticated, isInitialized, setUser } = useAuthStore();
  const { getHomeDeliveryEnabled, getPickupEnabled } = useSettingsStore();

  const homeDeliveryAvailable = getHomeDeliveryEnabled();
  const pickFromStoreAvailable = getPickupEnabled();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);

  // Where to send the user once their profile is complete (the Menu or
  // Cart page they came from). Captured once on mount so it isn't lost
  // when the "showOnboarding" query param is stripped from the URL below.
  const [redirectTarget] = useState(
    () => searchParams.get("redirect") || "/menu",
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>();

  // Auth protection and form initialization
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login?redirect=/profile");
      return;
    }

    // Fetch fresh profile data from API
    const fetchProfile = async () => {
      try {
        setIsLoading(true);

        const freshUser = await getProfile();

        // Update auth store
        setUser(freshUser);

        // Check if profile is incomplete
        setIsProfileIncomplete(
          !freshUser.name?.trim() || !freshUser.phone?.trim(),
        );

        // Populate form
        setValue("name", freshUser.name || "");

        const phoneDisplay = freshUser.phone
          ? freshUser.phone.replace(/^\+65/, "")
          : "";

        setValue("phone", phoneDisplay);

        // Profile image
        setProfileImageUrl(freshUser.profileImageUrl || null);
      } catch (error) {
        console.error("Failed to fetch profile:", error);

        // Fallback to cached user if API fails
        if (user) {
          setValue("name", user.name || "");

          const phoneDisplay = user.phone
            ? user.phone.replace(/^\+65/, "")
            : "";

          setValue("phone", phoneDisplay);

          setProfileImageUrl(user.profileImageUrl || null);

          setIsProfileIncomplete(!user.name?.trim() || !user.phone?.trim());
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, isInitialized, router, setUser, setValue]);

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<string> => {
    const url = await uploadProfileImage(file);
    setProfileImageUrl(url);
    return url;
  };

  // Form submit handler
  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);

    try {
      // Add +65 prefix to phone number if not already present and not empty
      let phoneToSave = data.phone?.trim() ? data.phone.trim() : undefined;
      if (phoneToSave && !phoneToSave.startsWith("+65")) {
        phoneToSave = `+65${phoneToSave}`;
      }

      const updatedUser = await updateProfile({
        name: data.name?.trim() || undefined,
        phone: phoneToSave,
        profileImageUrl: profileImageUrl || undefined,
      });

      setUser(updatedUser);

      // Hide the "Complete Your Profile" alert immediately
      setIsProfileIncomplete(false);

      // Refresh form values
      setValue("name", updatedUser.name || "");
      setValue(
        "phone",
        updatedUser.phone ? updatedUser.phone.replace(/^\+65/, "") : "",
      );

      const shouldOpenOnboarding =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("showOnboarding") ===
          "1";
      toast({
        title: "Profile completed successfully",
        description: shouldOpenOnboarding
          ? "Please continue setting up your order preferences."
          : "Redirecting you back...",
      });

      router.refresh();

      if (shouldOpenOnboarding) {
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", "/profile");
        }
        setShowOnboardingDialog(true);
      } else {
        setTimeout(() => {
          router.replace(redirectTarget);
        }, 1500);
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnboardingDialogChange = (open: boolean) => {
    setShowOnboardingDialog(open);
    if (!open) {
      router.replace(redirectTarget);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboardingDialog(false);
    router.replace(redirectTarget);
  };

  // Show loading state while fetching profile
  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>

        <CardContent>
          {isProfileIncomplete && (
            <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
              <p className="font-semibold text-amber-900">
                Complete Your Profile
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Please enter your name and phone number to continue ordering.
              </p>
            </div>
          )}

          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Picture */}
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-6">
                  {/* Avatar Preview */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-gray-200">
                      {profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <span className="text-3xl font-bold text-primary">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2">
                    <input
                      ref={(el) => {
                        profileImageInputRef.current = el;
                      }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setIsSubmitting(true);
                            await handleImageUpload(file);
                          } catch (error: unknown) {
                            toast({
                              title: "Error",
                              description:
                                error instanceof Error
                                  ? error.message
                                  : "Failed to upload image",
                              variant: "destructive",
                            });
                          } finally {
                            setIsSubmitting(false);
                          }
                        }
                        e.target.value = "";
                      }}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => profileImageInputRef.current?.click()}
                      disabled={isSubmitting}
                    >
                      {profileImageUrl ? "Change Photo" : "Upload Photo"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or WebP (max 2MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name (required)</Label>
                <Input
                  id="name"
                  {...register("name", {
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                  disabled={isSubmitting}
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email (Read-only) */}
              {user?.email && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
              )}

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (required)</Label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center px-3 py-2 bg-muted border border-input rounded-md text-muted-foreground font-medium h-10">
                    +65
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone", {
                      pattern: {
                        value: /^[689]\d{7}$/,
                        message: "Please enter a valid 8-digit phone number",
                      },
                      onChange: (e) => {
                        // Only allow numbers and limit to 8 digits
                        e.target.value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 8);
                      },
                    })}
                    disabled={isSubmitting}
                    placeholder="91234567"
                    maxLength={8}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  8-digit Singapore mobile number
                </p>
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <OnboardingDialog
        open={showOnboardingDialog}
        onOpenChange={handleOnboardingDialogChange}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-2xl mx-auto py-8 px-4">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading profile...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
