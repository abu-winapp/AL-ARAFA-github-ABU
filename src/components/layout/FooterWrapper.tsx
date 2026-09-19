'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function FooterWrapper() {
  const pathname = usePathname();

  // Don't render footer on admin routes or checkout
  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) {
    return null;
  }

  return <Footer />;
}
