"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import {
  useAuthStore,
  isCustomerAuthenticated,
} from "@/lib/store/useAuthStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  customerOnly?: boolean;
}

export function ProtectedRoute({
  children,
  customerOnly = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { isInitialized, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    // prevent redirect loop
    if (pathname === "/login") return;

    // not logged in
    if (!isAuthenticated) {
      router.replace(`/?login=true&redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    // customer protection
    if (customerOnly && !isCustomerAuthenticated(user, isAuthenticated)) {
      router.replace("/");

      return;
    }
  }, [isInitialized, isAuthenticated, user, customerOnly, pathname, router]);

  // prevent protected page flash

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="
          w-10
          h-10
          border-4
          border-primary
          border-t-transparent
          rounded-full
          animate-spin
          "
        />
      </div>
    );
  }

  return <>{children}</>;
}
