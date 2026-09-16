'use client';

import { usePathname } from 'next/navigation';

/**
 * MainWrapper
 * ------------
 * SiteHeader's top bar is `fixed` but only rendered from `md:` up
 * (`hidden md:block`) — on mobile there is no fixed top bar at all,
 * each page's own hero/section sits flush with the top of the screen.
 * The mobile bottom tab bar, however, is `fixed` on every breakpoint
 * below `md`, so page content still needs bottom clearance there.
 *  - Admin routes: no clearance — HeaderWrapper doesn't render
 *    SiteHeader there (AdminHeader is used instead).
 *  - Homepage: no TOP clearance at any size — HeroPage already reserves
 *    that space internally so the header can sit transparently over the
 *    hero image.
 *  - Every other page: top clearance ONLY from `md:` up, to clear the
 *    solid desktop/tablet top bar. Mobile gets zero top clearance since
 *    no fixed header exists there.
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
      className={`min-h-screen ${isHomePage ? '' : 'md:pt-[80px] lg:pt-[88px]'} pb-[86px] md:pb-0`}
    >
      {children}
    </main>
  );
}
