'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';

function HeaderFallback() {
  return (
    <header style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: '80px' }} />
      </div>
    </header>
  );
}

export function HeaderWrapper() {
  const pathname = usePathname();

  // Don't render customer header on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <Suspense fallback={<HeaderFallback />}>
      <Header />
    </Suspense>
  );
}
