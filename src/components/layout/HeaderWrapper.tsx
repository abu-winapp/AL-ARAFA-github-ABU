'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { SiteHeader } from './SiteHeader';

function HeaderFallback() {
  return (
    <header
      className="hidden md:block"
      style={{ backgroundColor: '#171717', position: 'fixed', insetInline: 0, top: 0, zIndex: 50 }}
    >
      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '0 24px' }}>
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
      <SiteHeader />
    </Suspense>
  );
}
