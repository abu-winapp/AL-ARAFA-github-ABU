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
  const isCustomer = isCustomerAuthenticated(user, isAuthenticated);

  useEffect(() => {
    if (!isInitialized) return;

    if (pathname === "/login") return;

    if (!isAuthenticated) {
      router.replace(`/?login=true&redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (customerOnly && !isCustomer) {
      router.replace("/");
      return;
    }
  }, [isInitialized, isAuthenticated, isCustomer, customerOnly, pathname, router]);

  if (!isInitialized || !isAuthenticated || (customerOnly && !isCustomer)) {
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
