"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

import {
  useAuthStore,
  isCustomerAuthenticated as isCustomerAuth,
} from "@/lib/store/useAuthStore";

import { useCartStore } from "@/lib/store/useCartStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const initialize = useAuthStore((state) => state.initialize);

  const logout = useAuthStore((state) => state.logout);

  const isInitialized = useAuthStore((state) => state.isInitialized);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const user = useAuthStore((state) => state.user);

  const fetchCart = useCartStore((state) => state.fetchCart);

  const isCustomerAuthenticated = isCustomerAuth(user, isAuthenticated);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  const handleLogout = useCallback(async () => {
    const isAdmin = user?.userType === "admin" || pathname?.startsWith("/admin");
    await logout();

    if (isAdmin) {
      router.replace("/admin/login");
    } else {
      router.replace("/login");
    }
  }, [logout, router, user, pathname]);

  useEffect(() => {
    window.addEventListener("auth:logout", handleLogout);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "alarafa_access_token" && !e.newValue) {
        logout();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [handleLogout, logout]);

  /*
    Load customer cart after authentication
  */
  useEffect(() => {
    if (isInitialized && isCustomerAuthenticated) {
      fetchCart();
    }
  }, [isInitialized, isCustomerAuthenticated, fetchCart]);

  return <>{children}</>;
}
