"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  useAuthStore,
  isCustomerAuthenticated as isCustomerAuth,
} from "@/lib/store/useAuthStore";

import { useCartStore } from "@/lib/store/useCartStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const initialize = useAuthStore((state) => state.initialize);

  const logout = useAuthStore((state) => state.logout);

  const isInitialized = useAuthStore((state) => state.isInitialized);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const user = useAuthStore((state) => state.user);

  const fetchCart = useCartStore((state) => state.fetchCart);

  const isCustomerAuthenticated = isCustomerAuth(user, isAuthenticated);

  /*
    Restore session when app loads
  */
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  /*
    Global 401 logout handler

    Axios interceptor triggers:
    window.dispatchEvent(
       new CustomEvent("auth:logout")
    )

  */
  const handleLogout = useCallback(async () => {
    await logout();

    router.replace("/login");
  }, [logout, router]);

  useEffect(() => {
    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [handleLogout]);

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
