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
 *  - Home, About, Menu, Contact: no TOP clearance at any size — each of
 *    these pages' own hero section reserves that space internally (tall +
 *    vertically centered content, or explicit header-height padding) so
 *    the header can float transparently over the hero background instead
 *    of sitting above a blank clearance strip.
 *  - Every other page: top clearance ONLY from `md:` up, to clear the
 *    solid desktop/tablet top bar. Mobile gets zero top clearance since
 *    no fixed header exists there.
 *  - All non-admin pages: bottom clearance on mobile for the fixed tab bar.
 */
const NO_TOP_CLEARANCE_PATHS = new Set(['/', '/about', '/menu', '/contact']);

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isCheckout = pathname.startsWith('/checkout');

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  const skipTopClearance = NO_TOP_CLEARANCE_PATHS.has(pathname) || isCheckout;

  return (
    <main
      className={`min-h-screen ${skipTopClearance ? '' : 'md:pt-[80px] lg:pt-[88px]'} ${isCheckout ? 'pb-0' : 'pb-[86px] md:pb-0'}`}
    >
      {children}
    </main>
  );
}
