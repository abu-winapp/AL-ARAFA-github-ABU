/**
 * Al-Arafa Restaurant - Authentication API Service
 */

import axios from "axios";
import apiClient from "./client";

import {
  saveTokens,
  clearTokens,
  getAccessToken,
} from "@/lib/auth/tokenManager";

import type {
  AuthResponse,
  OTPVerifyRequest,
  User
} from "@/types";

const USER_STORAGE_KEY = "alarafa_user";

/**
 * Store user data in localStorage
 */
export function setUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

/**
 * Get user data from localStorage
 */
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const userData = localStorage.getItem(USER_STORAGE_KEY);
  if (!userData) return null;

  try {
    return JSON.parse(userData) as User;
  } catch {
    return null;
  }
}

/**
 * Clear user data from localStorage
 */
export function clearUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * Request OTP for email
 */
export async function requestOTP(email: string): Promise<{ message: string }> {
  try {
    const response = await apiClient.post("/customer/auth/request-otp", {
      email,
    });
    return response.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message = err.response?.data?.message || err.response?.data?.error;
      if (message) throw new Error(message);
    }
    throw err;
  }
}

export async function verifyOTP(
  request: OTPVerifyRequest,
): Promise<AuthResponse> {
  let response;
  try {
    response = await apiClient.post("/customer/auth/verify-otp", request);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message = err.response?.data?.message || err.response?.data?.error;
      if (message) throw new Error(message);
    }
    throw err;
  }
  const authData: AuthResponse = response.data.data;

  saveTokens(authData.accessToken, authData.refreshToken);
  setUser(authData.user);

  return authData;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<AuthResponse> {
  const response = await apiClient.post("/auth/refresh", { refreshToken });

  const authData: AuthResponse = response.data.data;

  saveTokens(authData.accessToken, authData.refreshToken);

  return authData;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch {
  } finally {
    clearTokens();
    clearUser();
    if (typeof window !== "undefined") {
      localStorage.removeItem("userName");
      localStorage.removeItem("userPhone");
      localStorage.removeItem("profileComplete");
    }
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken();

  return !!token;
}
