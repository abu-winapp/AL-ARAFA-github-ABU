/**
 * Al-Arafa Restaurant - Auth Store (Zustand)
 */

import { create } from "zustand";
import * as authService from "@/lib/api/auth.service";

import type { User, AuthResponse } from "@/types";

export function isCustomerAuthenticated(
  user: User | null | undefined,
  isAuthenticated: boolean,
): boolean {
  if (!isAuthenticated || !user) return false;

  if (user.userType === "admin") return false;
  if (user.userType === "customer") return true;
 if (!user.userType && !user.role) return false;
  return (
    user.customer === true ||
    user.role === "customer" ||
    user.role === "CUSTOMER"
  );
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  initialize: () => void;
  login: (email: string, otpCode: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,

  initialize: () => {
    if (typeof window === "undefined") {
      set({
        isInitialized: true,
        isAuthenticated: false,
        user: null,
      });
      return;
    }

    set((state) => {
      if (state.isInitialized) {
        return state;
      }

      try {
        const isAuthenticated = authService.isAuthenticated();

        if (!isAuthenticated) {
          authService.clearUser();

          return {
            ...state,
            user: null,
            isAuthenticated: false,
            isInitialized: true,
          };
        }

        const storedUser = authService.getStoredUser();

        if (!storedUser) {
          return {
            ...state,
            user: null,
            isAuthenticated: false,
            isInitialized: true,
          };
        }

        return {
          ...state,
          user: storedUser,
          isAuthenticated: true,
          isInitialized: true,
        };
      } catch (error) {
        console.error("Failed to initialize auth:", error);

        authService.clearUser();

        return {
          ...state,
          user: null,
          isAuthenticated: false,
          isInitialized: true,
        };
      }
    });
  },

  login: async (email: string, otp: string) => {
    try {
      set({ isLoading: true, error: null });

      const authResponse = await authService.verifyOTP({ email, otp });

      set({
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return authResponse;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Login failed",
        isLoading: false,
        isAuthenticated: false,
      });

      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await authService.logout();

      // Clear cart on logout (import cart store to avoid circular dependency issues)
      if (typeof window !== "undefined") {
        const { useCartStore } = await import("./useCartStore");
        useCartStore.getState().clearCart();
      }

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Logout failed",
        isLoading: false,
      });
    }
  },

  setUser: (user: User | null) => {
    set((state) => {
      const nextUser = user ? { ...state.user, ...user } : null;

      if (nextUser) {
        authService.setUser(nextUser);
      } else {
        authService.clearUser();
      }

      return {
        user: nextUser,
        isAuthenticated: !!nextUser,
      };
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
