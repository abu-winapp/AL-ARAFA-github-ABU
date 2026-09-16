'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function FooterWrapper() {
  const pathname = usePathname();

  // Don't render footer on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return <Footer />;
}
