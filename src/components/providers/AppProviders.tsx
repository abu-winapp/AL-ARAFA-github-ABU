'use client';

import { AuthProvider } from './AuthProvider';

/**
 * AppProviders - Wraps all app-level providers
 * Centralizes provider configuration for the entire app
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
