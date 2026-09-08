'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { AdminHeader } from '@/components/layout/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Don't show header on login page OR if not authenticated as admin
  const isLoginPage = pathname === '/admin/login';
  const showAdminHeader = !isLoginPage && isAuthenticated && user?.userType === 'admin';

  return (
    <div className="min-h-screen bg-background-gray">
      {showAdminHeader && <AdminHeader />}
      {children}
    </div>
  );
}
