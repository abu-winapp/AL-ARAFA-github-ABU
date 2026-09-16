"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  Home,
  Utensils,
  Info,
  Menu as MenuIcon,
  X as CloseIcon,
  UserRound,
  ClipboardList,
  User,
  Phone,
  Headset,
  MapPin,
  LogOut,
} from "lucide-react";

import { useCartStore } from "@/lib/store/useCartStore";
import {
  useAuthStore,
  isCustomerAuthenticated as isCustomerAuth,
} from "@/lib/store/useAuthStore";
import { UserMenu } from "./UserMenu";
import { LoginSheet } from "@/components/auth/LoginSheet";

const logo = "/images/logo.webp";

export const SiteHeader: FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
  const [loginSheetOpen, setLoginSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getItemCount = useCartStore((state) => state.getItemCount);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const cartCount = getItemCount();

  const isCustomerAuthenticated =
    isCustomerAuth(user, isAuthenticated) || Boolean(user);

  const isHomePage = pathname === "/";

  // Transparent only on homepage before scrolling.
  // Every other page gets a solid header.
  const showTransparent = isHomePage && !isScrolled;

  /*
   * Close both mobile menus.
   */
  const closeMobileMenus = () => {
    setMobileMenuOpen(false);
    setMobileUserMenuOpen(false);
  };

  /*
   * SCROLL TRACKING
   */
  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(false);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]);

  /*
   * AUTO-OPEN LOGIN SHEET IF REDIRECTED WITH ?login=true
   */
  useEffect(() => {
    const shouldOpenLogin = searchParams.get("login");

    if (shouldOpenLogin === "true" && !isCustomerAuthenticated) {
      setLoginSheetOpen(true);

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("login");

      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams, isCustomerAuthenticated]);

  /*
   * DESKTOP NAVIGATION
   */
  const navLinkClass = `
    relative
    text-sm
    font-medium
    text-white/90
    transition
    hover:text-white

    after:absolute
    after:-bottom-2
    after:left-0
    after:h-px
    after:w-0
    after:bg-[#d9a14a]
    after:transition-all
    after:duration-300
    hover:after:w-full
  `;

  return (
    <>
      {/* 
          DESKTOP / TABLET HEADER
           */}

      <header
        className={`
          fixed inset-x-0 top-0 z-50 hidden w-full
          transition-colors duration-300 md:block
          ${
            showTransparent
              ? "bg-transparent"
              : "border-b border-white/10 bg-[#171717]/95 shadow-lg backdrop-blur-md"
          }
        `}
      >
        <div className="flex w-full items-center justify-between px-6 py-4 lg:px-10 lg:py-4 xl:px-16">
          {/* 
              LOGO
               */}

          <Link
            href="/"
            className="flex min-w-fit items-center outline-none"
            onClick={closeMobileMenus}
          >
            <img
              src={logo}
              alt="Al-Arafa Mandi Logo"
              className="h-12 w-auto lg:h-14"
            />
          </Link>

          {/* 
              DESKTOP NAVIGATION
               */}

          <nav className="hidden items-center gap-7 lg:flex xl:gap-10">
            <Link href="/" className={navLinkClass}>
              Home
            </Link>

            <Link href="/about" className={navLinkClass}>
              About
            </Link>

            <Link href="/menu" className={navLinkClass}>
              Menu
            </Link>

            <Link href="/contact" className={navLinkClass}>
              Contact
            </Link>
          </nav>

          {/* 
              RIGHT ACTIONS
               */}

          <div className="flex items-center gap-2 lg:gap-3">
            {/* CART */}

            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="
                relative flex size-10 items-center justify-center
                rounded-full border border-white/20
                bg-black/10 text-white
                backdrop-blur-md
                transition hover:bg-white/15
                lg:size-11
              "
            >
              <ShoppingCart className="size-[17px] lg:size-[18px]" />

              {isCustomerAuthenticated && cartCount > 0 && (
                <span
                  className="
                    absolute -right-0.5 -top-0.5
                    flex size-4 items-center justify-center
                    rounded-full bg-[#92251c]
                    text-[9px] font-bold text-white
                  "
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* 
                DESKTOP SIGN IN / USER MENU
                 */}

            {isCustomerAuthenticated && user ? (
              <UserMenu user={user} />
            ) : (
              <button
                type="button"
                onClick={() => setLoginSheetOpen(true)}
                className="
                  hidden items-center gap-2
                  rounded-full border border-white/25
                  px-5 py-2.5
                  text-sm font-medium text-white
                  backdrop-blur-md
                  transition hover:bg-white/10
                  md:inline-flex
                "
              >
                Sign In
              </button>
            )}

            {/* 
                DESKTOP CTA
                 */}

            <Link
              href="/contact"
              className="
                hidden items-center gap-2
                rounded-full bg-[#d9a14a]
                px-5 py-2.5
                text-sm font-semibold text-[#3d1c12]
                transition hover:bg-[#e6b45e]
                lg:inline-flex
              "
            >
              Book a Table
            </Link>

            {/* 
                TABLET HAMBURGER
                 */}

            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => {
                setMobileMenuOpen((prev) => !prev);
                setMobileUserMenuOpen(false);
              }}
              className="
                flex size-10 items-center justify-center
                rounded-full border border-white/20
                bg-black/10 text-white
                backdrop-blur-md
                transition hover:bg-white/15
                lg:hidden
              "
            >
              {mobileMenuOpen ? (
                <CloseIcon className="size-[18px]" />
              ) : (
                <MenuIcon className="size-[18px]" />
              )}
            </button>
          </div>
        </div>

        {/* 
            TABLET DROPDOWN
             */}

        {mobileMenuOpen && (
          <div
            className="
              border-b border-white/10
              bg-[#171717]/98
              px-6 py-4
              backdrop-blur-md
              lg:hidden
            "
          >
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={closeMobileMenus}
                className="
                  rounded-xl px-3 py-2.5
                  text-sm font-medium text-white/90
                  transition hover:bg-white/10 hover:text-white
                "
              >
                Home
              </Link>

              <Link
                href="/about"
                onClick={closeMobileMenus}
                className="
                  rounded-xl px-3 py-2.5
                  text-sm font-medium text-white/90
                  transition hover:bg-white/10 hover:text-white
                "
              >
                About
              </Link>

              <Link
                href="/menu"
                onClick={closeMobileMenus}
                className="
                  rounded-xl px-3 py-2.5
                  text-sm font-medium text-white/90
                  transition hover:bg-white/10 hover:text-white
                "
              >
                Menu
              </Link>

              <Link
                href="/contact"
                onClick={closeMobileMenus}
                className="
                  rounded-xl px-3 py-2.5
                  text-sm font-medium text-white/90
                  transition hover:bg-white/10 hover:text-white
                "
              >
                Contact
              </Link>

              {/* AUTHENTICATED TABLET OPTIONS */}

              {isCustomerAuthenticated && (
                <>
                  <div className="my-1 h-px bg-white/10" />

                  <Link
                    href="/profile"
                    onClick={closeMobileMenus}
                    className="
                      rounded-xl px-3 py-2.5
                      text-sm font-medium text-white/90
                      transition hover:bg-white/10 hover:text-white
                    "
                  >
                    Profile
                  </Link>

                  <Link
                    href="/orders"
                    onClick={closeMobileMenus}
                    className="
                      rounded-xl px-3 py-2.5
                      text-sm font-medium text-white/90
                      transition hover:bg-white/10 hover:text-white
                    "
                  >
                    Orders
                  </Link>

                  {/* <Link
                    href="/loyalty"
                    onClick={closeMobileMenus}
                    className="
                      rounded-xl px-3 py-2.5
                      text-sm font-medium text-white/90
                      transition hover:bg-white/10 hover:text-white
                    "
                  >
                    Rewards
                  </Link> */}
                  <Link
                    href="/contact"
                    onClick={closeMobileMenus}
                    className="
                      rounded-xl px-3 py-2.5
                      text-sm font-medium text-white/90
                      transition hover:bg-white/10 hover:text-white
                    "
                  >
                    Contact Us
                  </Link>

                  <Link
                    href="/addresses"
                    onClick={closeMobileMenus}
                    className="
                      rounded-xl px-3 py-2.5
                      text-sm font-medium text-white/90
                      transition hover:bg-white/10 hover:text-white
                    "
                  >
                    Addresses
                  </Link>

                  <button
                    type="button"
                    onClick={async () => {
                      closeMobileMenus();

                      await useAuthStore.getState().logout();

                      window.location.href = "/";
                    }}
                    className="
                      rounded-xl px-3 py-2.5
                      text-left text-sm font-medium
                      text-[#d9a14a]
                      transition hover:bg-white/10
                    "
                  >
                    Logout
                  </button>
                </>
              )}

              {/* NOT AUTHENTICATED */}

              {!isCustomerAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenus();
                    setLoginSheetOpen(true);
                  }}
                  className="
                    mt-2 rounded-full
                    bg-[#d9a14a]
                    px-5 py-2.5
                    text-sm font-semibold
                    text-[#3d1c12]
                    transition hover:bg-[#e6b45e]
                  "
                >
                  Sign In
                </button>
              )}

              {/* EVENT CTA */}

              <Link
                href="/contact"
                onClick={closeMobileMenus}
                className="
                  mt-3 flex items-center justify-center gap-2
                  rounded-full bg-[#d9a14a]
                  px-5 py-3
                  text-sm font-semibold text-[#3d1c12]
                  transition hover:bg-[#e6b45e]
                "
              >
                Book Your Event
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* 
  MOBILE FLOATING TAB BAR
*/}
  

      <nav
        className="
          fixed
          inset-x-0
          bottom-[calc(0.75rem+env(safe-area-inset-bottom))]
          z-50
          block
          px-3
          md:hidden
        "
      >
        <div
          className="
            relative
            mx-auto
            flex
            h-[66px]
            w-full
            max-w-[420px]
            items-center
            justify-between
            rounded-[34px]
            border
            border-black/[0.06]
            bg-white
            px-1.5
            shadow-[0_8px_30px_rgba(0,0,0,0.16)]
          "
        >
          {/* 
              HOME
               */}

          <Link
            href="/"
            aria-label="Home"
            className={`
              flex
              h-[56px]
              min-w-[62px]
              flex-1
              flex-col
              items-center
              justify-center
              rounded-full
              transition-all
              duration-200
              active:scale-95
              ${
                pathname === "/"
                  ? "bg-[#063B25] text-white shadow-[0_4px_12px_rgba(6,59,37,0.25)]"
                  : "text-[#6f7378] hover:text-[#222]"
              }
            `}
          >
            <Home
              className={`
                size-[21px]
                ${
                  pathname === "/"
                    ? "text-white"
                    : "text-[#6f7378]"
                }
              `}
              strokeWidth={pathname === "/" ? 2.2 : 1.8}
            />

            <span
              className={`
                mt-0.5
                text-[10px]
                font-semibold
                leading-none
                ${
                  pathname === "/"
                    ? "text-white"
                    : "text-[#6f7378]"
                }
              `}
            >
              Home
            </span>
          </Link>

          {/* 
              MENU
               */}

          <Link
            href="/menu"
            aria-label="Menu"
            className={`
              flex
              h-[56px]
              min-w-[62px]
              flex-1
              flex-col
              items-center
              justify-center
              rounded-full
              transition-all
              duration-200
              active:scale-95
              ${
                pathname === "/menu"
                  ? "bg-[#063B25] text-white shadow-[0_4px_12px_rgba(6,59,37,0.25)]"
                  : "text-[#6f7378] hover:text-[#222]"
              }
            `}
          >
            <Utensils
              className={`
                size-[21px]
                ${
                  pathname === "/menu"
                    ? "text-white"
                    : "text-[#6f7378]"
                }
              `}
              strokeWidth={pathname === "/menu" ? 2.2 : 1.8}
            />

            <span
              className={`
                mt-0.5
                text-[10px]
                font-semibold
                leading-none
                ${
                  pathname === "/menu"
                    ? "text-white"
                    : "text-[#6f7378]"
                }
              `}
            >
              Menu
            </span>
          </Link>

          {/* 
              CART
               */}

          <Link
            href="/cart"
            aria-label="Cart"
            className={`
              relative
              flex
              h-[56px]
              min-w-[62px]
              flex-1
              flex-col
              items-center
              justify-center
              rounded-full
              transition-all
              duration-200
              active:scale-95
              ${
                pathname === "/cart"
                  ? "bg-[#063B25] text-white shadow-[0_4px_12px_rgba(6,59,37,0.25)]"
                  : "text-[#6f7378] hover:text-[#222]"
              }
            `}
          >
            <ShoppingCart
              className={`
                size-[21px]
                ${
                  pathname === "/cart"
                    ? "text-white"
                    : "text-[#6f7378]"
                }
              `}
              strokeWidth={pathname === "/cart" ? 2.2 : 1.8}
            />

            <span
              className={`
                mt-0.5
                text-[10px]
                font-semibold
                leading-none
                ${
                  pathname === "/cart"
                    ? "text-white"
                    : "text-[#6f7378]"
                }
              `}
            >
              Cart
            </span>

            {isCustomerAuthenticated && cartCount > 0 && (
              <span
                className="
                  absolute
                  right-[8px]
                  top-[5px]
                  flex
                  size-[18px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[#92251c]
                  text-[9px]
                  font-bold
                  text-white
                  shadow-sm
                "
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* 
              ORDERS
               */}

          <Link
            href="/orders"
            aria-label="Orders"
            className={`
              flex
              h-[56px]
              min-w-[62px]
              flex-1
              flex-col
              items-center
              justify-center
              rounded-full
              transition-all
              duration-200
              active:scale-95
              ${
                pathname === "/orders"
                  ? "bg-[#063B25] text-white shadow-[0_4px_12px_rgba(6,59,37,0.25)]"
                  : "text-[#6f7378] hover:text-[#222]"
              }
            `}
          >
            <ClipboardList
              className={`
                size-[21px]
                ${
                  pathname === "/orders"
                    ? "text-white"
                    : "text-[#6f7378]"
                }
              `}
              strokeWidth={pathname === "/orders" ? 2.2 : 1.8}
            />

            <span
              className={`
                mt-0.5
                text-[10px]
                font-semibold
                leading-none
                ${
                  pathname === "/orders"
                    ? "text-white"
                    : "text-[#6f7378]"
                }
              `}
            >
              Orders
            </span>
          </Link>

          {/* 
              PROFILE / SIGN IN
               */}

          {isCustomerAuthenticated && user ? (
            <div className="flex flex-1">
              <button
                type="button"
                aria-label="Open profile menu"
                aria-expanded={mobileUserMenuOpen}
                onClick={() => {
                  setMobileUserMenuOpen((prev) => !prev);
                  setMobileMenuOpen(false);
                }}
                className={`
                  flex
                  h-[56px]
                  w-full
                  min-w-[62px]
                  flex-col
                  items-center
                  justify-center
                  rounded-full
                  transition-all
                  duration-200
                  active:scale-95
                  ${
                    pathname === "/profile"
                      ? "bg-[#063B25] text-white shadow-[0_4px_12px_rgba(6,59,37,0.25)]"
                      : mobileUserMenuOpen
                        ? "bg-[#063B25]/[0.08] text-[#063B25]"
                        : "text-[#6f7378] hover:text-[#222]"
                  }
                `}
              >
                {/* USER AVATAR */}

                <div
                  className={`
                    relative
                    flex
                    size-[21px]
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-full
                    ${
                      pathname === "/profile"
                        ? "bg-white/20"
                        : "bg-[#92251c]"
                    }
                  `}
                >
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={
                        user.preferredName ||
                        user.fullName ||
                        user.name ||
                        "Profile"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[9px] font-bold text-white">
                      {(
                        user.preferredName ||
                        user.fullName ||
                        user.name ||
                        user.email ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <span
                  className={`
                    mt-0.5
                    text-[10px]
                    font-semibold
                    leading-none
                    ${
                      pathname === "/profile"
                        ? "text-white"
                        : "text-[#6f7378]"
                    }
                  `}
                >
                  Profile
                </span>
              </button>
            </div>
          ) : (
            /* 
               MOBILE SIGN IN
                */

            <button
              type="button"
              onClick={() => setLoginSheetOpen(true)}
              className="
                flex
                h-[56px]
                min-w-[62px]
                flex-1
                flex-col
                items-center
                justify-center
                rounded-full
                text-[#6f7378]
                transition-all
                duration-200
                active:scale-95
                hover:text-[#222]
              "
            >
              <UserRound
                className="size-[21px] text-[#6f7378]"
                strokeWidth={1.8}
              />

              <span className="mt-0.5 text-[10px] font-semibold leading-none">
                Sign In
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* 
          MOBILE PROFILE TOP DRAWER
           */}

      {mobileUserMenuOpen && isCustomerAuthenticated && user && (
        <>
          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close profile menu"
            onClick={() => setMobileUserMenuOpen(false)}
            className="
              fixed
              inset-0
              z-[60]
              bg-black/40
              backdrop-blur-[2px]
              md:hidden
            "
          />

          {/* 
              TOP DRAWER
               */}

          <section
            role="dialog"
            aria-modal="true"
            aria-label="Profile menu"
            className="
              fixed
              inset-x-0
              top-0
              z-[70]
              max-h-[75vh]
              overflow-y-auto
              rounded-b-[28px]
              border-b
              border-black/[0.06]
              bg-white
              px-4
              pb-5
              pt-[calc(0.75rem+env(safe-area-inset-top))]
              shadow-[0_12px_45px_rgba(0,0,0,0.20)]
              md:hidden
            "
          >
            <div className="mx-auto w-full max-w-[520px]">

              {/* 
                  HEADER / CLOSE
                   */}

              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">



                </div>

                <button
                  type="button"
                  aria-label="Close profile menu"
                  onClick={() => setMobileUserMenuOpen(false)}
                  className="
                    flex
                    size-9
                    items-center
                    justify-center
                    rounded-full
                    bg-black/[0.045]
                    text-[#555]
                    transition
                    active:scale-95
                    active:bg-black/[0.08]
                  "
                >
                  <CloseIcon className="size-[17px]" />
                </button>
              </div>

              {/* 
                  USER HEADER
                   */}

              <div
                className="
                  mb-3
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  bg-[#faf8f4]
                  px-4
                  py-3
                "
              >
                {/* AVATAR */}

                <div
                  className="
                    flex
                    size-11
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-full
                    bg-[#92251c]
                  "
                >
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={
                        user.preferredName ||
                        user.fullName ||
                        user.name ||
                        "Profile"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {(
                        user.preferredName ||
                        user.fullName ||
                        user.name ||
                        user.email ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                {/* USER DETAILS */}

<div className="min-w-0 flex-1">
  <p className="m-0 truncate text-sm mb-3 font-bold leading-none text-[#222]">
    {user.preferredName ||
      user.fullName ||
      user.name ||
      "User"}
  </p>

  {user.email && (
    <p className="m-0 truncate text-[11px] font-normal leading-none text-black/45">
      {user.email}
    </p>
  )}
</div>
              </div>

              {/* 
                  ACCOUNT
                   */}

              <div className="mb-2">


                {/* PROFILE */}

                <Link
                  href="/profile"
                  onClick={() => setMobileUserMenuOpen(false)}
                  className="
                    flex
                    min-h-[52px]
                    items-center
                    gap-3
                    rounded-2xl
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    text-[#292929]
                    transition
                    active:scale-[0.98]
                    active:bg-black/[0.04]
                  "
                >
                  <span
                    className="
                      flex
                      size-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#f5eee9]
                    "
                  >
                    <User className="size-[18px] text-[#92251c]" />
                  </span>

                  <span className="flex-1">Profile</span>

                  <span className="text-lg leading-none text-black/25">
                    ›
                  </span>
                </Link>

                {/* ADDRESSES */}

                <Link
                  href="/addresses"
                  onClick={() => setMobileUserMenuOpen(false)}
                  className="
                    flex
                    min-h-[52px]
                    items-center
                    gap-3
                    rounded-2xl
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    text-[#292929]
                    transition
                    active:scale-[0.98]
                    active:bg-black/[0.04]
                  "
                >
                  <span
                    className="
                      flex
                      size-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#f5eee9]
                    "
                  >
                    <MapPin className="size-[18px] text-[#92251c]" />
                  </span>

                  <span className="flex-1">Addresses</span>

                  <span className="text-lg leading-none text-black/25">
                    ›
                  </span>
                </Link>
              </div>

              {/* 
                  SUPPORT
                   */}

              <div className="mb-2 border-t border-black/[0.07] pt-2">


                {/* CUSTOMER CARE */}

                <Link
                  // href="/customer-care"
                  href="/contact"
                  onClick={() => setMobileUserMenuOpen(false)}
                  className="
                    flex
                    min-h-[52px]
                    items-center
                    gap-3
                    rounded-2xl
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    text-[#292929]
                    transition
                    active:scale-[0.98]
                    active:bg-black/[0.04]
                  "
                >
                  <span
                    className="
                      flex
                      size-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#f5eee9]
                    "
                  >
                    <Headset className="size-[18px] text-[#92251c]" />
                  </span>

                  <span className="flex-1">Customer Care</span>

                  <span className="text-lg leading-none text-black/25">
                    ›
                  </span>
                </Link>

                {/* CONTACT */}

                <Link
                  href="/contact"
                  onClick={() => setMobileUserMenuOpen(false)}
                  className="
                    flex
                    min-h-[52px]
                    items-center
                    gap-3
                    rounded-2xl
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    text-[#292929]
                    transition
                    active:scale-[0.98]
                    active:bg-black/[0.04]
                  "
                >
                  <span
                    className="
                      flex
                      size-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#f5eee9]
                    "
                  >
                    <Phone className="size-[18px] text-[#92251c]" />
                  </span>

                  <span className="flex-1">Contact Us</span>

                  <span className="text-lg leading-none text-black/25">
                    ›
                  </span>
                </Link>
              </div>

              {/* 
                  ABOUT + LOGOUT
                   */}

              <div className="border-t border-black/[0.07] pt-2">
                {/* ABOUT */}

                <Link
                  href="/about"
                  onClick={() => setMobileUserMenuOpen(false)}
                  className="
                    flex
                    min-h-[52px]
                    items-center
                    gap-3
                    rounded-2xl
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    text-[#292929]
                    transition
                    active:scale-[0.98]
                    active:bg-black/[0.04]
                  "
                >
                  <span
                    className="
                      flex
                      size-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#f5eee9]
                    "
                  >
                    <Info className="size-[18px] text-[#92251c]" />
                  </span>

                  <span className="flex-1">About Us</span>

                  <span className="text-lg leading-none text-black/25">
                    ›
                  </span>
                </Link>

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={async () => {
                    closeMobileMenus();

                    await useAuthStore.getState().logout();

                    window.location.href = "/";
                  }}
                  className="
                    flex
                    min-h-[52px]
                    w-full
                    items-center
                    gap-3
                    rounded-2xl
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    font-medium
                    text-[#92251c]
                    transition
                    active:scale-[0.98]
                    active:bg-[#92251c]/[0.05]
                  "
                >
                  <span
                    className="
                      flex
                      size-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#92251c]/[0.08]
                    "
                  >
                    <LogOut className="size-[18px]" />
                  </span>

                  <span className="flex-1">Logout</span>
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 
          LOGIN SHEET
           */}

      <LoginSheet
        open={loginSheetOpen}
        onOpenChange={setLoginSheetOpen}
        redirectTo={searchParams.get("redirect") || "/menu"}
      />
    </>
  );
};
