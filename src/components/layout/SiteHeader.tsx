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


  const hideMobileTabBar =
  pathname === "/cart" ||
  pathname.startsWith("/checkout");

  return (
    <>
      {/* 
        DESKTOP / TABLET HEADER
     */}

      <header
        className="
    fixed
    inset-x-4
    top-4
    z-50
    hidden
    overflow-visible
    rounded-full
    border
    border-[#221a16]/10
    bg-[#F6F2E6]/95
    shadow-[0_10px_35px_rgba(34,26,22,0.10)]
    backdrop-blur-xl
    md:block
    lg:inset-x-6
    xl:inset-x-10
  "
      >
        <div
          className="
    flex
    min-h-[72px]
    w-full
    items-center
    justify-between
    px-5
    sm:px-6
    lg:px-8
    xl:px-10
  "
        >
          {/* 
        LOGO
     */}

          <Link
            href="/"
            className="
        flex
        min-w-fit
        items-center
        outline-none
      "
            onClick={closeMobileMenus}
          >
            <img
              src={logo}
              alt="Al-Arafa Mandi Logo"
              className="
          h-12
          w-auto
          object-contain
          lg:h-14
        "
            />
          </Link>

          {/* 
        DESKTOP NAVIGATION
     */}

          <nav
            className="
        hidden
        items-center
        gap-8
        lg:flex
        xl:gap-11
      "
          >
            <Link
              href="/"
              className="
          text-[20px]
          font-semibold
          tracking-[-0.01em]
          text-[#221a16]
          transition-colors
          duration-200
          hover:text-[#92251c]
          hover:underline
          hover:decoration-[#95221C]
          hover:decoration-2
          hover:underline-offset-8
        "
            >
              Home
            </Link>

            <Link
              href="/about"
              className="
          text-[20px]
          font-semibold
          tracking-[-0.01em]
          text-[#221a16]
          transition-colors
          duration-200
          hover:text-[#92251c]
          hover:underline
          hover:decoration-[#95221C]
          hover:decoration-2
          hover:underline-offset-8
        "
            >
              About
            </Link>

            <Link
              href="/menu"
              className="
          text-[20px]
          font-semibold
          tracking-[-0.01em]
          text-[#221a16]
          transition-colors
          duration-200
          hover:text-[#92251c]
          hover:underline
          hover:decoration-[#95221C]
          hover:decoration-2
          hover:underline-offset-8
        "
            >
              Menu
            </Link>

            <Link
              href="/contact"
              className="
          text-[20px]
          font-semibold
          tracking-[-0.01em]
          text-[#221a16]
          transition-colors
          duration-200
          hover:text-[#92251c]
          hover:underline
          hover:decoration-[#95221C]
          hover:decoration-2
          hover:underline-offset-8
        "
            >
              Contact
            </Link>
          </nav>

          {/* 
        RIGHT ACTIONS
     */}

          <div className="flex items-center gap-2 lg:gap-3">
            {/* ==
          CART
      == */}

            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="
          group
          relative
          flex
          size-10
          items-center
          justify-center
          rounded-full
          border
          border-[#221a16]/10
          bg-white
          text-[#221a16]
          transition-all
          duration-200
          hover:border-[#95221C]/30
          hover:text-[#95221C]
          hover:shadow-[0_5px_15px_rgba(15,15,15,0.08)]
          lg:size-11
        "
            >
              <ShoppingCart
                className="
            size-[17px]
            transition-transform
            duration-200
            group-hover:scale-105
            lg:size-[20px]
          "
              />

              {isCustomerAuthenticated && cartCount > 0 && (
                <span
                  className="
              absolute
              -right-1
              -top-1
              flex
              size-[18px]
              items-center
              justify-center
              rounded-full
              border-2
              border-[#95221C]
              bg-white
              text-[9px]
              font-extrabold
              leading-none
              text-[#95221C]
              shadow-[0_2px_8px_rgba(15,15,15,0.12)]
            "
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ==
          DESKTOP SIGN IN / USER MENU
      == */}
            {isCustomerAuthenticated && user ? (
              <div>
                <UserMenu user={user} />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLoginSheetOpen(true)}
                className="
            hidden
            items-center
            justify-center
            rounded-full
            border
            border-[#95221C]/20
            bg-white
            px-5
            py-2.5
            text-sm
            font-semibold
            text-[#95221C]
            transition-all
            duration-200
            hover:border-[#95221C]
            hover:bg-[#95221C]
            hover:text-white
            md:inline-flex
          "
              >
                Sign In
              </button>
            )}

            {/* ==
          DESKTOP CTA
      == */}

            <Link
              href="/contact"
              className="
          hidden
          items-center
          justify-center
          rounded-full
          bg-[#95221C]
          px-5
          py-2.5
          text-sm
          font-bold
          text-white
          transition-all
          duration-200
          hover:bg-[#7a1c17]
          hover:shadow-[0_6px_18px_rgba(149,34,28,0.18)]
          lg:inline-flex
        "
            >
              Book a Table
            </Link>

            {/* ==
          TABLET HAMBURGER
      == */}

            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => {
                setMobileMenuOpen((prev) => !prev);
                setMobileUserMenuOpen(false);
              }}
              className="
          flex
          size-10
          items-center
          justify-center
          rounded-full
          border
          border-[#221a16]/10
          bg-white
          text-[#221a16]
          transition-all
          duration-200
          hover:border-[#95221C]
          hover:text-[#95221C]
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

        {/* ==
      TABLET DROPDOWN
  == */}

        {mobileMenuOpen && (
          <div
            className="
        border-t
        border-[#221a16]/10
        bg-[#F6F2E6]
        px-6
        py-4
        shadow-[0_10px_30px_rgba(15,15,15,0.08)]
        lg:hidden
      "
          >
            <nav className="flex flex-col gap-1">
              {/* HOME */}

              <Link
                href="/"
                onClick={closeMobileMenus}
                className="
            rounded-xl
            px-3
            py-3
            text-[15px]
            font-semibold
            text-[#221a16]
            transition
            hover:bg-[#95221C]/[0.06]
            hover:text-[#95221C]
          "
              >
                Home
              </Link>

              {/* ABOUT */}

              <Link
                href="/about"
                onClick={closeMobileMenus}
                className="
            rounded-xl
            px-3
            py-3
            text-[15px]
            font-semibold
            text-[#221a16]
            transition
            hover:bg-[#95221C]/[0.06]
            hover:text-[#95221C]
          "
              >
                About
              </Link>

              {/* MENU */}

              <Link
                href="/menu"
                onClick={closeMobileMenus}
                className="
            rounded-xl
            px-3
            py-3
            text-[15px]
            font-semibold
            text-[#221a16]
            transition
            hover:bg-[#95221C]/[0.06]
            hover:text-[#95221C]
          "
              >
                Menu
              </Link>

              {/* CONTACT */}

              <Link
                href="/contact"
                onClick={closeMobileMenus}
                className="
            rounded-xl
            px-3
            py-3
            text-[15px]
            font-semibold
            text-[#221a16]
            transition
            hover:bg-[#95221C]/[0.06]
            hover:text-[#95221C]
          "
              >
                Contact
              </Link>

              {/* 
            AUTHENTICATED TABLET OPTIONS
         */}

              {isCustomerAuthenticated && (
                <>
                  <div className="my-2 h-px bg-[#221a16]/10" />

                  <Link
                    href="/profile"
                    onClick={closeMobileMenus}
                    className="
                rounded-xl
                px-3
                py-3
                text-[15px]
                font-semibold
                text-[#221a16]
                transition
                hover:bg-[#95221C]/[0.06]
                hover:text-[#95221C]
              "
                  >
                    Profile
                  </Link>

                  <Link
                    href="/orders"
                    onClick={closeMobileMenus}
                    className="
                rounded-xl
                px-3
                py-3
                text-[15px]
                font-semibold
                text-[#221a16]
                transition
                hover:bg-[#95221C]/[0.06]
                hover:text-[#95221C]
              "
                  >
                    Orders
                  </Link>

                  <Link
                    href="/contact"
                    onClick={closeMobileMenus}
                    className="
                rounded-xl
                px-3
                py-3
                text-[15px]
                font-semibold
                text-[#221a16]
                transition
                hover:bg-[#95221C]/[0.06]
                hover:text-[#95221C]
              "
                  >
                    Contact Us
                  </Link>

                  <Link
                    href="/addresses"
                    onClick={closeMobileMenus}
                    className="
                rounded-xl
                px-3
                py-3
                text-[15px]
                font-semibold
                text-[#221a16]
                transition
                hover:bg-[#95221C]/[0.06]
                hover:text-[#95221C]
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
                rounded-xl
                px-3
                py-3
                text-left
                text-[15px]
                font-semibold
                text-[#95221C]
                transition
                hover:bg-[#95221C]/[0.06]
              "
                  >
                    Logout
                  </button>
                </>
              )}

              {/* 
            NOT AUTHENTICATED
         */}

              {!isCustomerAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenus();
                    setLoginSheetOpen(true);
                  }}
                  className="
              mt-3
              rounded-full
              border
              border-[#95221C]
              bg-white
              px-5
              py-3
              text-sm
              font-bold
              text-[#95221C]
              transition
              hover:bg-[#95221C]
              hover:text-white
            "
                >
                  Sign In
                </button>
              )}

              {/* 
            EVENT CTA
         */}

              <Link
                href="/contact"
                onClick={closeMobileMenus}
                className="
            mt-3
            flex
            items-center
            justify-center
            gap-2
            rounded-full
            bg-[#95221C]
            px-5
            py-3
            text-sm
            font-bold
            text-white
            transition-all
            duration-200
            hover:bg-[#0F0F0F]
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



{!hideMobileTabBar && (
  <nav>

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
          border-[#0F0F0F]/10
          bg-[#FFFFFF]
          px-1.5
          shadow-[0_8px_30px_rgba(15,15,15,0.16)]
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
                ? `
                  bg-[#95221C]
                  text-[#FFFFFF]
                  shadow-[0_4px_12px_rgba(185,9,11,0.25)]
                `
                : `
                  text-[#0F0F0F]/50
                  hover:text-[#95221C]
                `
            }
          `}
          >
            <Home
              className={`
              size-[21px]
              ${pathname === "/" ? "text-[#FFFFFF]" : "text-[#0F0F0F]/50"}
            `}
              strokeWidth={pathname === "/" ? 2.2 : 1.8}
            />

            <span
              className={`
              mt-0.5
              text-[10px]
              font-semibold
              leading-none
              ${pathname === "/" ? "text-[#FFFFFF]" : "text-[#0F0F0F]/50"}
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
                ? `
                  bg-[#95221C]
                  text-[#FFFFFF]
                  shadow-[0_4px_12px_rgba(185,9,11,0.25)]
                `
                : `
                  text-[#0F0F0F]/50
                  hover:text-[#95221C]
                `
            }
          `}
          >
            <Utensils
              className={`
              size-[21px]
              ${pathname === "/menu" ? "text-[#FFFFFF]" : "text-[#0F0F0F]/50"}
            `}
              strokeWidth={pathname === "/menu" ? 2.2 : 1.8}
            />

            <span
              className={`
              mt-0.5
              text-[10px]
              font-semibold
              leading-none
              ${pathname === "/menu" ? "text-[#FFFFFF]" : "text-[#0F0F0F]/50"}
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
                ? `
                  bg-[#95221C]
                  text-[#FFFFFF]
                  shadow-[0_4px_12px_rgba(185,9,11,0.25)]
                `
                : `
                  text-[#0F0F0F]/50
                  hover:text-[#95221C]
                `
            }
          `}
          >
            <ShoppingCart
              className={`
              size-[21px]
              ${pathname === "/cart" ? "text-[#FFFFFF]" : "text-[#0F0F0F]/50"}
            `}
              strokeWidth={pathname === "/cart" ? 2.2 : 1.8}
            />

            <span
              className={`
              mt-0.5
              text-[10px]
              font-semibold
              leading-none
              ${pathname === "/cart" ? "text-[#FFFFFF]" : "text-[#0F0F0F]/50"}
            `}
            >
              Cart
            </span>

            {isCustomerAuthenticated && cartCount > 0 && (
              <span
                className="
                absolute
                right-[7px]
                top-[4px]
                flex
                size-[18px]
                items-center
                justify-center
                rounded-full
                border-2
                border-[#95221C]
                bg-[#FFFFFF]
                text-[9px]
                font-extrabold
                leading-none
                text-[#95221C]
                shadow-[0_2px_6px_rgba(15,15,15,0.12)]
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
                ? `
                  bg-[#95221C]
                  text-[#FFFFFF]
                  shadow-[0_4px_12px_rgba(185,9,11,0.25)]
                `
                : `
                  text-[#0F0F0F]/50
                  hover:text-[#95221C]
                `
            }
          `}
          >
            <ClipboardList
              className={`
              size-[21px]
              ${pathname === "/orders" ? "text-[#FFFFFF]" : "text-[#0F0F0F]/50"}
            `}
              strokeWidth={pathname === "/orders" ? 2.2 : 1.8}
            />

            <span
              className={`
              mt-0.5
              text-[10px]
              font-semibold
              leading-none
              ${pathname === "/orders" ? "text-[#FFFFFF]" : "text-[#0F0F0F]/50"}
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
                    ? `
                      bg-[#95221C]
                      text-[#FFFFFF]
                      shadow-[0_4px_12px_rgba(185,9,11,0.25)]
                    `
                    : mobileUserMenuOpen
                      ? `
                        bg-[#95221C]/[0.06]
                        text-[#95221C]
                      `
                      : `
                        text-[#0F0F0F]/50
                        hover:text-[#95221C]
                      `
                }
              `}
              >
                {/* USER AVATAR */}
                <div
                  className="
    relative
    flex
    size-[26px]
    items-center
    justify-center
    overflow-hidden
    rounded-full
    bg-[#FFFFFF]
    text-[#95221C]
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
                    <span className="text-sm font-extrabold leading-none text-[#95221C]">
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
                      ? "text-[#FFFFFF]"
                      : "text-[#0F0F0F]/50"
                  }
                `}
                >
                  Profile
                </span>
              </button>
            </div>
          ) : (
            /* =================================================
             MOBILE SIGN IN
          ================================================= */

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
              text-[#0F0F0F]/50
              transition-all
              duration-200
              active:scale-95
              hover:text-[#95221C]
            "
            >
              <UserRound
                className="
                size-[21px]
                text-[#0F0F0F]/50
              "
                strokeWidth={1.8}
              />

              <span
                className="
                mt-0.5
                text-[10px]
                font-semibold
                leading-none
              "
              >
                Sign In
              </span>
            </button>
          )}
        </div>
      </nav>
  </nav>
)}





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
              bg-[#0F0F0F]/40
              md:hidden
            "
          />

          {/* TOP DRAWER */}

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
              border-[#0F0F0F]/10
              bg-[#FFFFFF]
              px-4
              pb-5
              pt-[calc(0.75rem+env(safe-area-inset-top))]
              shadow-[0_12px_45px_rgba(15,15,15,0.18)]
              md:hidden
            "
          >
            <div className="mx-auto w-full max-w-[520px]">
              {/* HEADER / CLOSE */}

              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2" />

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
                    bg-[#0F0F0F]/[0.05]
                    text-[#0F0F0F]
                    transition
                    active:scale-95
                    active:bg-[#95221C]/[0.08]
                    active:text-[#95221C]
                  "
                >
                  <CloseIcon className="size-[17px]" />
                </button>
              </div>

              {/* USER HEADER */}

              <div
                className="
                  mb-3
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-[#0F0F0F]/10
                  bg-[#FFFFFF]
                  px-4
                  py-3
                  shadow-[0_5px_18px_rgba(15,15,15,0.05)]
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
                    border-2
                    border-[#95221C]
                    bg-[#FFFFFF]
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
                    <span className="text-base font-extrabold leading-none text-[#95221C]">
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
                  <p
                    className="
                      m-0
                      mb-2
                      truncate
                      text-sm
                      font-bold
                      leading-none
                      text-[#0F0F0F]
                    "
                  >
                    {user.preferredName || user.fullName || user.name || "User"}
                  </p>

                  {user.email && (
                    <p
                      className="
                        m-0
                        truncate
                        text-[11px]
                        font-normal
                        leading-none
                        text-[#0F0F0F]/45
                      "
                    >
                      {user.email}
                    </p>
                  )}
                </div>
              </div>

              {/* ACCOUNT */}

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
                    font-semibold
                    text-[#0F0F0F]
                    transition
                    active:scale-[0.98]
                    active:bg-[#95221C]/[0.05]
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
                      bg-[#95221C]/[0.08]
                    "
                  >
                    <User className="size-[18px] text-[#95221C]" />
                  </span>

                  <span className="flex-1">Profile</span>

                  <span className="text-lg leading-none text-[#0F0F0F]/25">
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
                    font-semibold
                    text-[#0F0F0F]
                    transition
                    active:scale-[0.98]
                    active:bg-[#95221C]/[0.05]
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
                      bg-[#95221C]/[0.08]
                    "
                  >
                    <MapPin className="size-[18px] text-[#95221C]" />
                  </span>

                  <span className="flex-1">Addresses</span>

                  <span className="text-lg leading-none text-[#0F0F0F]/25">
                    ›
                  </span>
                </Link>
              </div>

              {/* SUPPORT */}

              <div
                className="
                  mb-2
                  border-t
                  border-[#0F0F0F]/10
                  pt-2
                "
              >
                {/* CUSTOMER CARE */}

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
                    font-semibold
                    text-[#0F0F0F]
                    transition
                    active:scale-[0.98]
                    active:bg-[#95221C]/[0.05]
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
                      bg-[#95221C]/[0.08]
                    "
                  >
                    <Headset className="size-[18px] text-[#95221C]" />
                  </span>

                  <span className="flex-1">Customer Care</span>

                  <span className="text-lg leading-none text-[#0F0F0F]/25">
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
                    font-semibold
                    text-[#0F0F0F]
                    transition
                    active:scale-[0.98]
                    active:bg-[#95221C]/[0.05]
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
                      bg-[#95221C]/[0.08]
                    "
                  >
                    <Phone className="size-[18px] text-[#95221C]" />
                  </span>

                  <span className="flex-1">Contact Us</span>

                  <span className="text-lg leading-none text-[#0F0F0F]/25">
                    ›
                  </span>
                </Link>
              </div>

              {/* ABOUT + LOGOUT */}

              <div
                className="
                  border-t
                  border-[#0F0F0F]/10
                  pt-2
                "
              >
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
                    font-semibold
                    text-[#0F0F0F]
                    transition
                    active:scale-[0.98]
                    active:bg-[#95221C]/[0.05]
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
                      bg-[#95221C]/[0.08]
                    "
                  >
                    <Info className="size-[18px] text-[#95221C]" />
                  </span>

                  <span className="flex-1">About Us</span>

                  <span className="text-lg leading-none text-[#0F0F0F]/25">
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
                    font-semibold
                    text-[#95221C]
                    transition
                    active:scale-[0.98]
                    active:bg-[#95221C]/[0.05]
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
                      bg-[#95221C]/[0.08]
                    "
                  >
                    <LogOut className="size-[18px] text-[#95221C]" />
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
