"use client";

import { FC, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/store/useCartStore";
import {
  useAuthStore,
  isCustomerAuthenticated as isCustomerAuth,
} from "@/lib/store/useAuthStore";
import { UserMenu } from "./UserMenu";
import { LoginSheet } from "@/components/auth/LoginSheet";
import { NotificationBell } from "@/components/notifications";

export const Header: FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginSheetOpen, setLoginSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const getItemCount = useCartStore((state) => state.getItemCount);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const cartCount = getItemCount();

  // Treat authenticated users as customers when userType is missing,
  // but still hide admin users from the customer header.
  const isCustomerAuthenticated = isCustomerAuth(user, isAuthenticated);
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(false);
      return;
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Auto-open login sheet if redirected from login page
  useEffect(() => {
    const shouldOpenLogin = searchParams.get("login");
    if (shouldOpenLogin === "true" && !isCustomerAuthenticated) {
      setLoginSheetOpen(true);
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("login");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams, isCustomerAuthenticated]);

  return (
    <header
      className={`${isHomePage ? "sticky top-0 w-full" : "sticky top-0"} z-[100] border-b transition-colors duration-300 ${
        isHomePage && !isScrolled
          ? "border-[#a83b32] bg-[#92251c] shadow-[0_4px_20px_rgba(74,20,16,0.18)] backdrop-blur-0"
          : "border-[#a83b32] bg-[#92251c] shadow-[0_4px_20px_rgba(74,20,16,0.18)] backdrop-blur-md"
      }`}
    >
      <div className="mx-auto w-full max-w-[1280px] lg:max-w-[1400px] xl:max-w-[1500px] 2xl:max-w-[1650px] px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* NAVBAR */}
        <div className="flex min-h-[88px] items-center justify-between gap-4 py-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex min-w-fit flex-col items-center text-decoration-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="mb-1 flex h-8 items-center justify-center">
              <svg
                width="31"
                height="31"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#f3d6a0]"
              >
                <path d="M12 3a3 3 0 0 0-3 3 3 3 0 0 0-4 2.83A3.5 3.5 0 0 0 5.5 15H7v3a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-3h1.5a3.5 3.5 0 0 0 .5-6.17A3 3 0 0 0 15 6a3 3 0 0 0-3-3Z" />
                <path d="M8 15h8" />
                <path d="M10 21v-3" />
                <path d="M14 21v-3" />
              </svg>
            </div>

            <h1 className="font-serif text-[20px] font-semibold tracking-[0.14em] text-[#fffaf5] sm:text-[24px]">
              AL-ARAFA
            </h1>

            <div className="mt-1 flex items-center gap-2 whitespace-nowrap text-[8px] tracking-[0.2em] text-[#f3d6a0] sm:text-[10px] sm:tracking-[0.25em]">
              <span className="h-px w-2 bg-[#f3d6a0] sm:w-3" />
              EST. 2026
              <span className="h-px w-2 bg-[#f3d6a0] sm:w-3" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden flex-1 items-center justify-center gap-8 text-[15px] font-medium text-[#fffaf5] xl:flex 2xl:gap-12 2xl:text-[16px]">
            <Link
              href="/"
className="relative text-[#fffaf5] transition-colors duration-200 hover:text-[#f3d6a0] after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-0 after:bg-[#f3d6a0] after:transition-all after:duration-200 hover:after:w-full"            >
              Home
            </Link>

            <Link
              href="/about"
              className="relative text-[#fffaf5] transition-colors duration-200 hover:text-[#f3d6a0] after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-0 after:bg-[#f3d6a0] after:transition-all after:duration-200 hover:after:w-full"
            >
              About
            </Link>

            <Link
              href="/menu"
              className="relative text-[#fffaf5] transition-colors duration-200 hover:text-[#f3d6a0] after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-0 after:bg-[#f3d6a0] after:transition-all after:duration-200 hover:after:w-full"
            >
              Menu
            </Link>

            <Link
              href="/contact"
              className="relative text-[#fffaf5] transition-colors duration-200 hover:text-[#f3d6a0] after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-0 after:bg-[#f3d6a0] after:transition-all after:duration-200 hover:after:w-full"
            >
              Contact
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex min-w-fit items-center gap-2 sm:gap-3">
                        {/* Cart */}
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#fffaf5] transition hover:bg-white/10"
              aria-label="Cart"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>

              {isCustomerAuthenticated && cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f3d6a0] px-1 text-[10px] font-bold text-[#92251c]">
                  {cartCount}
                </span>
              )}
            </Link>
            {/* Sign In / User Menu */}
            {isCustomerAuthenticated && user ? (
              <UserMenu user={user} />
            ) : (
              <button
                onClick={() => setLoginSheetOpen(true)}
                className="hidden items-center gap-2 rounded-full border border-[#f3d6a0] px-5 py-2.5 text-[14px] font-medium text-[#f3d6a0] transition hover:bg-[#f3d6a0] hover:text-[#92251c] md:inline-flex"
              >
                Sign In
              </button>
            )}

            {/* Notification Bell */}
            {isCustomerAuthenticated && <NotificationBell />}



            {/* CTA */}
            <Link
              href="/contact"
              className="hidden items-center gap-2 rounded-full bg-[#f3d6a0] px-5 py-3 text-[14px] font-semibold text-[#92251c] shadow-[0_8px_22px_rgba(74,20,16,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#e8bd79] hover:shadow-[0_12px_28px_rgba(74,20,16,0.24)] lg:inline-flex"
            >
              Call us now
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#fffaf5] transition hover:bg-white/10 xl:hidden"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M6 18 18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/15 py-5 xl:hidden">
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                className="rounded-xl px-4 py-3 text-[16px] font-medium text-[#fffaf5] transition hover:bg-white/10 hover:text-[#f3d6a0]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>

              <Link
                href="/about"
                className="rounded-xl px-4 py-3 text-[16px] font-medium text-[#fffaf5] transition hover:bg-white/10 hover:text-[#f3d6a0]"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>

              <Link
                href="/menu"
                className="rounded-xl px-4 py-3 text-[16px] font-medium text-[#fffaf5] transition hover:bg-white/10 hover:text-[#f3d6a0]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Menu
              </Link>

              <Link
                href="/contact"
                className="rounded-xl px-4 py-3 text-[16px] font-medium text-[#fffaf5] transition hover:bg-white/10 hover:text-[#f3d6a0]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>

              <div className="my-2 h-px bg-white/15" />

              {!isCustomerAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLoginSheetOpen(true);
                  }}
                  className="mt-2 w-full rounded-full bg-[#f3d6a0] px-5 py-3.5 text-[15px] font-semibold text-[#92251c] shadow-[0_8px_22px_rgba(74,20,16,0.18)]"
                >
                  Sign In
                </button>
              ) : (
                <>
                  <Link
                    href="/profile"
                    className="rounded-xl px-4 py-3 text-[16px] font-medium text-[#fffaf5] transition hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>

                  <Link
                    href="/orders"
                    className="rounded-xl px-4 py-3 text-[16px] font-medium text-[#fffaf5] transition hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>

                  <Link
                    href="/loyalty"
                    className="rounded-xl px-4 py-3 text-[16px] font-medium text-[#fffaf5] transition hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Rewards
                  </Link>

                  <Link
                    href="/addresses"
                    className="rounded-xl px-4 py-3 text-[16px] font-medium text-[#fffaf5] transition hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Addresses
                  </Link>

                  <button
                    onClick={async () => {
                      await useAuthStore.getState().logout();
                      setMobileMenuOpen(false);
                      window.location.href = "/";
                    }}
                    className="rounded-xl px-4 py-3 text-left text-[16px] font-medium text-[#f3d6a0] transition hover:bg-white/10"
                  >
                    Logout
                  </button>
                </>
              )}

              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[#f3d6a0] px-5 py-3.5 text-[15px] font-semibold text-[#92251c] shadow-[0_8px_22px_rgba(74,20,16,0.18)] transition hover:bg-[#e8bd79]"
              >
                Book Your Event
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Login Sheet */}
      <LoginSheet
        open={loginSheetOpen}
        onOpenChange={setLoginSheetOpen}
        redirectTo={searchParams.get("redirect") || "/menu"}
      />
    </header>
  );
};
