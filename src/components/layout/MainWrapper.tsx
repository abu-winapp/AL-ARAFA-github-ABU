'use client';

import { usePathname } from 'next/navigation';

/**
 * MainWrapper
 * ------------
 * SiteHeader's top bar is `fixed`, and its mobile bottom tab bar is
 * `fixed` too, so page content needs clearance padding or it renders
 * underneath them.
 *  - Admin routes: no clearance — HeaderWrapper doesn't render
 *    SiteHeader there (AdminHeader is used instead).
 *  - Homepage: no TOP clearance — HeroPage already reserves that space
 *    internally so the header can sit transparently over the hero image.
 *  - Every other page: top clearance for the solid top bar.
 *  - All non-admin pages: bottom clearance on mobile for the fixed tab bar.
 */
export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  const isHomePage = pathname === '/';

  return (
    <main
      className={`min-h-screen ${isHomePage ? '' : 'pt-[80px] lg:pt-[88px]'} pb-[86px] md:pb-0`}
    >
      {children}
    </main>
  );
}
