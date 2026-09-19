"use client";

import Hero from "./HeroPage";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import GoogleReviews from "./GoogleReviews";
import Faq from "./Faq";

import {
  ChevronRight,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  ArrowUpRight,
  Star,
} from "lucide-react";

import { getCategories, getMenuItems } from "@/lib/api/menu.service";
import * as locationService from "@/lib/api/location.service";

import type { Category, MenuItem } from "@/types";

import { MenuCard } from "@/components/menu/MenuCard";
import { CartBar } from "@/components/cart/CartBar";
import { LoginSheet } from "@/components/auth/LoginSheet";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useCartStore } from "@/lib/store/useCartStore";
import OrderOption from "./OrderOption";

import Image from "next/image";

const catName = "Categories"

const herobg = "/images/HeroBg.webp";

const serving = "/images/serving.png";
const alarafa = "/images/AL-ARAFA.png";

const logo = "/images/logo.webp";

const heroFood = "/images/food_4.png";
const food1 = "/images/food_1.png";
const food2 = "/images/food_2.png";
const food3 = "/images/food_3.png";

const img1 = "/images/rating.png";
const img2 = "/images/happycostomer.png";
const img3 = "/images/fast.png";
const img4 = "/images/legacy.png";

const Trust1 = "/images/TrustAndQuality-1.png";
const Trust2 = "/images/TrustAndQuality-2.png";
const Trust3 = "/images/TrustAndQuality-3.png";
const Trust4 = "/images/TrustAndQuality-4.png";
const Trust5 = "/images/TrustAndQuality-5.png";
const Trust6 = "/images/TrustAndQuality-6.png";

const dish1 = "/images/dish-1.jpg";
const goodfoodbg = "/images/goodfoodbg.png";

const reviewimg1 = "/images/mandi-1.webp";
const reviewimg2 = "/images/mandi-2.webp";
const reviewimg3 = "/images/mandi-3.webp";

const orderWays1 = "/images/dinein.png";
const orderWays2 = "/images/takeaway.png";
const orderWays3 = "/images/delivery.png";

const restaurant = "/images/restaurant.webp";

const orderWays = [
  {
    id: "dine-in",
    title: "Dine In",
    description: "Enjoy your meal at our restaurant",
    image: orderWays1,
  },
  {
    id: "takeaway",
    title: "Takeaway",
    description: "Pick up your order and enjoy it anywhere",
    image: orderWays2,
  },
  {
    id: "delivery",
    title: "Delivery",
    description: "Get your favourite food delivered to you",
    image: orderWays3,
  },
];

export default function Home() {
  const phone = "+65 8454 4567";
  const email = "info@alarafacuisine.com";
  const whatsapp = "6584544567";
  const address = "218B Changi Rd, Singapore 419737";

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address,
  )}`;

  const [selectedMethod, setSelectedMethod] = useState("dine-in");

  const trustCards = [
    {
      title: "Google Rating",
      description:
        "Loved by our customers for our authentic taste, quality ingredients, and delicious food.",
      icon: img1,
    },
    {
      title: "Happy Customers",
      description:
        "Serving thousands of happy customers with great food, warm service.",
      icon: img2,
    },
    {
      title: "30 Min Fast Delivery",
      description:
        "Enjoy your favorite meals delivered hot and fresh to your doorstep with quick and reliable service.",
      icon: img3,
    },
    {
      title: "Years of Legacy",
      description:
        "Built on years of experience, tradition, and a passion for serving delicious food to every customer.",
      icon: img4,
    },
  ];

  const images = [
    {
      src: "/images/restaurant-1.png",
      alt: "Restaurant food",
    },
    {
      src: "/images/restaurant-2.png",
      alt: "Restaurant dining",
    },
    {
      src: "/images/restaurant-3.png",
      alt: "Restaurant experience",
    },
  ];

  const trustItems = [
    {
      image: Trust1,
      title: "100% Halal",
      description: "Prepared with care and trusted ingredients.",
    },
    {
      image: Trust2,
      title: "Fresh Ingredients",
      description: "Only fresh, quality ingredients go into every dish.",
    },
    {
      image: Trust3,
      title: "Hygienic Kitchen",
      description: "Maintaining high standards of cleanliness and hygiene.",
    },
  ];

  //  Hero plate slideshow

  const heroPlates = [
    { src: heroFood, alt: "Chef's signature platter" },
    { src: food1, alt: "Fork Theory street food fusion" },
    { src: food2, alt: "Melt District cheesy indulgence" },
    { src: food3, alt: "Fresh seasonal special" },
    { src: dish1, alt: "Hyderabadi chicken biryani" },
  ];

  const [activePlate, setActivePlate] = useState(0);
  const [plateEntered, setPlateEntered] = useState(false);

  useEffect(() => {
    setPlateEntered(false);
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setPlateEntered(true));
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, [activePlate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePlate((prev) => (prev + 1) % heroPlates.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroPlates.length]);

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: "left" | "right") => {
    if (!categoryScrollRef.current) return;

    const scrollAmount = 320;

    categoryScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollToCategory = (categoryId: string) => {
    document.getElementById(categoryId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoadingCategories(true);

        const [categoriesData, menuItemsData] = await Promise.all([
          getCategories("regular"),
          getMenuItems({ menuType: "regular" }),
        ]);

        setCategories(
          categoriesData
            .filter((category) => category.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder),
        );

        setMenuItems(menuItemsData);
      } catch (error) {
        console.error("Failed to load menu:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadMenu();
  }, []);

  const groupedItems = menuItems.reduce<Record<string, { items: MenuItem[] }>>(
    (acc, item) => {
      const categoryId = item.categoryId;

      if (!acc[categoryId]) {
        acc[categoryId] = {
          items: [],
        };
      }

      acc[categoryId].items.push(item);

      return acc;
    },
    {},
  );

  const homeMenuSections = categories
    .map((category, index) => ({
      category,
      items: (groupedItems[category.id]?.items ?? []).slice(
        0,
        index === 0 ? 4 : 8,
      ),
    }))
    .filter((section) => section.items.length > 0)
    .slice(0, 2);

  const { isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();

  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [loginSheetOpen, setLoginSheetOpen] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await locationService.getActiveLocations();

        if (
          locationsData &&
          Array.isArray(locationsData) &&
          locationsData.length > 0
        ) {
          setSelectedLocationId(locationsData[0].id);
        }
      } catch (error) {
        console.error("Failed to load locations:", error);
      }
    };

    fetchLocations();

    if (isAuthenticated) {
      fetchCart();
    }
  }, [fetchCart, isAuthenticated]);

  const handleLoginPrompt = () => {
    setLoginSheetOpen(true);
  };

  const handleLoginSuccess = () => {
    fetchCart();
  };

  return (
    <>
      <div className="home-page">
        {/* MAIN SECTION */}
        <section className="text-[#221a16] bg-[#F6F2E6]">
          {/* hero */}

          <Hero />

{/* FOOD CATEGORIES */}
<section
  id="categories"
  className="
    mx-auto
    w-full
    max-w-[1700px]
    px-4
    sm:px-6
    md:px-8
    lg:px-8
    xl:px-10
    2xl:px-12
  "
>
  {/* CATEGORY HEADER */}
  <div
    className="
      mb-5
      flex
      items-end
      justify-between
      gap-4
      sm:mb-6
      lg:mb-7
    "
  >
    <h3
      className="
        m-0
        font-display
        text-[22px]
        font-bold
        leading-none
        tracking-[-0.025em]
        text-[#221a16]
        sm:text-2xl
        lg:text-3xl
      "
    >
      Categories
    </h3>

    <Link
      href="/menu"
      className="
        group
        flex
        shrink-0
        items-center
        gap-1
        text-[10px]
        font-bold
        uppercase
        tracking-[0.12em]
        text-[#92251c]
        transition-colors
        duration-200
        hover:text-[#6f1b15]
        sm:text-xs
        lg:text-sm
      "
    >
      <span>View all</span>

      <ChevronRight
        className="
          size-4
          transition-transform
          duration-200
          group-hover:translate-x-1
        "
      />
    </Link>
  </div>


{/* RESPONSIVE CATEGORY GRID */}
<div
  className="
    w-full

    /* MOBILE: HORIZONTAL SWIPE */
    flex
    gap-3
    overflow-x-auto
    overflow-y-hidden
    snap-x
    snap-mandatory
    pb-2
    [-ms-overflow-style:none]
    [scrollbar-width:none]
    [&::-webkit-scrollbar]:hidden

    /* TABLET + DESKTOP */
    sm:grid
    sm:grid-cols-2
    sm:gap-4
    sm:overflow-visible

    lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]
    lg:gap-5
  "
>
  {categories.map((category) => {
    const items = groupedItems[category.id]?.items ?? [];

    const imageUrl =
      category.imageUrl ||
      items.find((item) => item.imageUrl)?.imageUrl;

    return (
      <Link
        key={category.id}
        href={`/menu?category=${category.id}`}
        scroll={false}
        className="
          group
          flex
          shrink-0
          snap-start
          items-center
          overflow-hidden
          rounded-[13px]
          border
          border-[#eadfd2]
          bg-[#fffaf4]
          p-2
          text-left
          shadow-[0_4px_16px_rgba(70,45,25,0.07)]
          transition-all
          duration-300

          /* 2.5 CARDS VISIBLE ON MOBILE */
          w-[calc((100vw-3.5rem)/2.5)]

          hover:-translate-y-0.5
          hover:border-[#d9c5ad]
          hover:shadow-[0_7px_22px_rgba(70,45,25,0.11)]

          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#7a231d]
          focus-visible:ring-offset-2

          sm:w-full
          sm:rounded-[17px]
          sm:p-2.5
        "
      >
        {/* CATEGORY IMAGE */}
        <div
          className="
            relative
            h-[46px]
            w-[48px]
            shrink-0
            overflow-hidden
            rounded-[9px]
            bg-[#efe6d6]

            sm:h-[66px]
            sm:w-[76px]
            sm:rounded-[12px]
          "
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              loading="lazy"
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                ease-out
                group-hover:scale-[1.06]
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                w-full
                items-center
                justify-center
                bg-gradient-to-br
                from-[#f7f1e6]
                to-[#efdfb8]
              "
            >
              <span
                className="
                  text-[13px]
                  font-bold
                  text-[#7a231d]
                  sm:text-2xl
                "
              >
                {category.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* CATEGORY CONTENT */}
        <div
          className="
            min-w-0
            flex-1
            px-1.5
            sm:px-3
          "
        >
          {/* FULL CATEGORY NAME */}
<h4
  className="
    w-full
    break-words
    line-clamp-2
    text-[10px]
    font-bold
    leading-[1.15]
    tracking-[-0.01em]
    text-[#221a16]
    transition-colors
    duration-300
    group-hover:text-[#92251c]

    min-[360px]:text-[10px]
    min-[390px]:text-[11px]
    min-[430px]:text-[12px]

    sm:text-[13px]
  "
>
  {category.name}
</h4>

          {/* EXPLORE */}
          <div
            className="
              mt-1
              flex
              items-center
              gap-0.5
              whitespace-nowrap
              text-[7px]
              font-bold
              leading-none
              text-[#92251c]

              min-[360px]:text-[8px]
              min-[390px]:text-[9px]
              min-[430px]:text-[10px]

              sm:mt-2
            "
          >
            <span>Explore</span>

            <ChevronRight
              className="
                size-2.5
                shrink-0
                transition-transform
                duration-200
                group-hover:translate-x-0.5

                sm:size-3
              "
            />
          </div>
        </div>
      </Link>
    );
  })}
</div>
</section>


{/* MOST ORDERED DISHES */}
<section className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 md:px-8 lg:px-4  xl:px-10 2xl:px-12">
  {loadingCategories ? (
    <div className="flex items-center justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7a231d] border-t-transparent" />
    </div>
  ) : !selectedLocationId ? (
    <div className="py-12 text-center text-sm text-[#6b6058]">
      Menu items are unavailable right now.
    </div>
  ) : (
    <div className="pt-10 sm:pt-12 lg:pt-14">
      {homeMenuSections
        .slice(0, 2)
        .map(({ category, items }, index) => {
          const productsToShow = index === 0 ? 4 : 8;

          return (
            <section
              key={category.id}
              className={`
                ${index === 0 ? "mb-14 sm:mb-16 lg:mb-20" : ""}
              `}
            >
              {/* CATEGORY TITLE */}
              <div
                className="
                  mb-5
                  flex
                  items-end
                  justify-between
                  gap-4
                  sm:mb-6
                  lg:mb-7
                "
              >
                <h3
                  className="
                    m-0
                    font-display
                    text-[22px]
                    font-bold
                    leading-none
                    tracking-[-0.025em]
                    text-[#221a16]
                    sm:text-2xl
                    lg:text-3xl
                  "
                >
                  {category.name}
                </h3>

                <Link
                  href={`/menu?category=${category.id}`}
                  scroll={false}
                  className="
                    group
                    flex shrink-0
                    items-center gap-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-[#92251c]
                    transition-colors
                    duration-200
                    hover:text-[#6f1b15]
                    sm:text-xs
                    lg:text-sm
                  "
                >
                  <span>View all</span>

                  <ChevronRight
                    className="
                      size-4
                      transition-transform
                      duration-200
                      group-hover:translate-x-1
                    "
                  />
                </Link>
              </div>

              {/* PRODUCTS */}
              <div
                className="
                  grid
                  w-full
                  grid-cols-1
                  gap-5
                  sm:grid-cols-2
                  sm:gap-6
                  lg:grid-cols-4
                  lg:gap-6
                  xl:gap-7
                "
              >
                {items
                  .slice(0, productsToShow)
                  .map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      locationId={selectedLocationId}
                      onLoginRequired={handleLoginPrompt}
                    />
                  ))}
              </div>
            </section>
          );
        })}

      {/* VIEW MENU */}
      <div className="flex justify-center pb-8 pt-1 sm:pb-10 lg:pb-12">
        <Link
          href="/menu"
          className="
            group
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-[#7a231d]
            px-7
            py-3
            text-xs
            font-semibold
            uppercase
            tracking-[0.14em]
            text-[#7a231d]
            transition-all
            duration-300
            hover:bg-[#7a231d]
            hover:text-white
            sm:px-8
            sm:py-3.5
            sm:text-sm
          "
        >
          <span>View Menu</span>

          <ChevronRight
            className="
              size-4
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </Link>
      </div>
    </div>
  )}
</section>

        </section>

        {/* Order Options Section */}
        <OrderOption
          menuType="regular"
          homeDeliveryAvailable={true}
          pickFromStoreAvailable={true}
        />

        {/* Trust Section */}
        <section className="w-full bg-[#fffbf3] px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-[1280px] lg:max-w-[1400px] xl:max-w-[1500px] 2xl:max-w-[1650px]">
            {/* Section Header */}
            <div className="mx-auto mb-10 max-w-[720px] text-center sm:mb-12 lg:mb-14">
              <div className="mb-3 flex items-center justify-center gap-3">
                <span className="text-[10px] font-semibold tracking-[0.22em] text-[#a9812f] sm:text-[11px] lg:text-[12px]">
                  WHY CHOOSE US
                </span>
              </div>

              <h2 className="font-serif text-[30px] font-bold leading-[1.08] tracking-[-0.025em] text-[#221a16] sm:text-[36px] lg:text-[44px]">
                Trusted by <span className="text-[#7a231d]">thousands</span>
              </h2>

              <p className="mx-auto mt-4 max-w-[580px] text-[14px] leading-7 text-[#6b6058] sm:text-[15px]">
                From carefully selected ingredients to every meal we serve,
                quality, warmth and consistency are at the heart of Al-Arafa.
              </p>
            </div>

            {/* Trust Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {trustCards.map((card, index) => (
                <div
                  key={index}
                  className="
            group
            relative
            flex
            min-h-[auto]
            flex-col
            overflow-hidden
            rounded-[20px]
            border
            border-[#e7dcc9]
            bg-white
            transition-all
            duration-500
            hover:-translate-y-1
            hover:border-[#e7dcc9]
            hover:shadow-[0_18px_45px_rgba(60,40,25,0.10)]
          "
                >
                  {/* Top Content */}
                  <div className="relative z-20 p-6 sm:p-7">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-[10px] font-semibold tracking-[0.2em] text-[#7a231d]">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="max-w-[250px] font-serif text-[24px] font-bold leading-[1.12] tracking-[-0.02em] text-[#221a16]">
                      {card.title}
                    </h3>

                    <p className="mt-3 max-w-[260px] text-[13px] leading-[1.7] text-[#6b6058]">
                      {card.description}
                    </p>
                  </div>

                  {/* Bottom Accent */}
                  <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#7a231d] transition-all duration-500 group-hover:w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Telling */}
        <section className="w-full overflow-hidden bg-[white]">
          <div className="mt-6 flex w-full flex-col items-center text-center sm:mt-8 lg:mt-10">
            {/* Eyebrow */}
            <div className="mb-2.5 flex items-center justify-center gap-2.5 text-[9px] font-semibold tracking-[0.18em] text-[#a9812f] sm:mb-3 sm:gap-3 sm:text-[10px] sm:tracking-[0.2em] lg:text-[11px] lg:tracking-[0.22em]">
              <span>OUR STORY</span>
            </div>

            {/* Heading */}
            <h2 className="mb-3 max-w-[320px] font-serif text-2xl font-bold leading-tight text-[#221a16] sm:mb-4 sm:max-w-none sm:text-3xl lg:mb-5 lg:text-4xl">
              Rooted In <span className="text-[#7a231d]">Tradition</span>
            </h2>
          </div>
          <div className="mx-auto w-full max-w-[1650px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">
            {/* Row 1 — Image Left / Content Right */}
            <div className="grid w-full grid-cols-1 overflow-hidden rounded-[24px] md:grid-cols-2 lg:rounded-[28px]">
              {/* Image 1 */}
              <div className="group relative h-[45vh] min-h-[360px] w-full overflow-hidden md:h-[560px] lg:h-[600px] xl:h-[640px]">
                <Image
                  src={images[0].src}
                  alt={images[0].alt}
                  fill
                  priority
                  sizes="(max-width: 767px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>

              {/* Content 1 */}
              <div className="flex min-h-[430px] w-full items-center justify-center bg-[#f7f1e6] px-7 py-14 text-center sm:px-12 sm:py-16 md:min-h-0 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
                <div className="max-w-[560px]">
                  <img
                    src={serving}
                    alt="Every meal served with love"
                    className="mx-auto mb-6 h-auto w-[90px] sm:mb-7 sm:w-[110px] lg:w-[120px]"
                  />

                  <span className="mb-4 block text-[11px] font-medium uppercase tracking-[0.3em] text-[#7a231d]/70 sm:text-[12px]">
                    Our Story
                  </span>

                  <h2 className="mb-5 font-serif text-[30px] leading-[1.12] text-[#221a16] sm:text-[36px] lg:mb-6 lg:text-[44px] xl:text-[46px]">
                    A Tradition Made With Passion
                  </h2>

                  <p className="text-justify font-serif text-[16px] leading-[1.8] text-[#6b6058] sm:text-[17px] lg:text-[18px]">
                    Every dish carries a story of tradition, craftsmanship, and
                    generations of culinary passion. From carefully selected
                    ingredients to the final presentation, we believe every meal
                    deserves to be remembered.
                  </p>

                  <div className="mt-7 flex items-center justify-center lg:mt-8">
                    <Link
                      href="/about"
                      className="hidden items-center gap-2 hover:text-[white] rounded-full bg-[#7a231d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5c1b16] lg:inline-flex"
                    >
                      Our Story
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* SPACE BEFORE FULL WIDTH IMAGE */}
            <div className="h-6 sm:h-8 lg:h-10" />

            {/* Row 3 — Full Width Image and video */}
            <div className="group relative h-[45vh] min-h-[360px] w-full overflow-hidden rounded-[24px] sm:h-[50vh] lg:h-[600px] xl:h-[650px] lg:rounded-[28px]">
              <video
                src="/videos/herovid.mp4"
                autoPlay
                loop
                muted
                playsInline
                aria-label="Restaurant experience"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </div>
          </div>
          {/* serving */}
          <section className="relative w-full overflow-hidden bg-[#f7f1e6]">
            {/* AL-ARAFA watermark */}
            <img
              src={alarafa}
              alt=""
              aria-hidden="true"
              className="
      pointer-events-none
      absolute
      left-1/2
      top-1/2
      z-0
      w-[115%]
      max-w-none
      -translate-x-1/2
      -translate-y-1/2
      opacity-[0.045]
      select-none
    "
            />

            {/* Main content */}
            <div
              className="
      relative
      z-10
      mx-auto
      flex
      min-h-[520px]
      w-full
      max-w-[1500px]
      flex-col
      items-center
      justify-center
      px-6
      py-20
      text-center

      sm:min-h-[560px]
      sm:px-10
      sm:py-24

      lg:min-h-[650px]
      lg:px-16
      lg:py-28
    "
            >
              {/* Serving icon */}
              <img
                src={logo}
                alt="Every meal served with love"
                className="
        mb-8
        h-auto
        w-[120px]

        sm:mb-9
        sm:w-[140px]

        md:w-[155px]

        lg:mb-10
        lg:w-[170px]
      "
              />

              {/* Text */}
              <div
                className="
        w-full
        max-w-[900px]
        text-[#221a16]
      "
              >
                <p
                  className="
          font-serif
          text-[20px]
          font-normal
          leading-[1.45]
          tracking-[-0.01em]

          sm:text-[23px]
          sm:leading-[1.4]

          md:text-[26px]

          lg:text-[30px]
          lg:leading-[1.38]

          xl:text-[32px]
        "
                >
                  Every meal we serve is made with love and care. From our
                  kitchen to your table, every bite tells a story. We use fresh
                  ingredients, authentic flavors, and a whole lot of heart.
                  Because good food fills the stomach, but food made with love
                  fills the soul.
                </p>
              </div>

              {/* Bottom ornament */}
              <div className="mt-10 flex flex-col items-center sm:mt-12 lg:mt-14">


                <span
                  className="
          mt-2
          text-[18px]
          text-[#92251C]

          sm:text-[20px]
        "
                >
                  ✦
                </span>
              </div>
            </div>
          </section>
        </section>
        {/* instagram */}
                  <section className="mx-auto w-full max-w-[1650px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">

            <div className="group relative h-[45vh] min-h-[360px] w-full overflow-hidden rounded-[24px] sm:h-[50vh] lg:h-[600px] xl:h-[650px] lg:rounded-[28px]">

            {/* Restaurant / Food Image */}
            <div
              className="
        absolute inset-y-0 right-0
        w-[52%]
        sm:w-[48%]
        lg:w-[45%]
      "
            >
              <img
                src={restaurant}
                alt="Restaurant"
                className="
          h-full w-full
          object-cover
          object-center
        "
              />
            </div>

            {/* Dark gradient */}
            <div
              className="
    absolute inset-0
    bg-gradient-to-r
    from-[#92251C]
    via-[#92251C]/95
    to-transparent
  "
            />

            {/* Content */}
            <div
              className="
        relative z-10
        flex h-full
        w-[68%]
        flex-col
        justify-center

        px-5
        sm:px-8
        lg:px-12
        xl:px-16
      "
            >
              <p
                className="
          font-serif
          font-semibold
          leading-[1.05]
          text-white

          text-[22px]
          sm:text-[27px]
          lg:text-[34px]
          xl:text-[38px]
        "
              >
                More Food.
                <br />
                More Memories.
              </p>

              <p
                className="
          mt-3
          max-w-[300px]
          text-white/75

          text-[10px]
          leading-[1.5]

          sm:text-[12px]
          lg:text-[14px]
        "
              >
                Follow us on <br /> Instagram for the <br /> latest updates and{" "}
                <br /> offers.
              </p>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="
          mt-4
          flex w-fit
          items-center gap-2
          rounded-full
          border border-white
          text-white
          transition-all
          duration-300
          hover:bg-white
          hover:text-[#062c20]

          px-4 py-2
          text-[10px]

          sm:px-5
          sm:py-2.5
          sm:text-[11px]

          lg:px-6
          lg:py-3
          lg:text-[13px]
        "
              >
                {/* Instagram icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>

                <span>Follow Us</span>

          
              </a>
            </div>
          </div>
        </section>

        {/* GOOGLE REVIEWS */}

        {/* <GoogleReviews /> */}
        {/* 
                  Google Reviews
               */}
        <div
          className="
                  google-review-card
                  mx-auto
                  my-10
                  max-w-[880px]
                  overflow-hidden
                  rounded-[22px]
                  border
                  border-[#7a231d]/15
                  bg-[#fffbf3]
                  px-5
                  py-5
                  shadow-[0_12px_40px_rgba(70,45,25,0.06)]
                  sm:px-7
                  sm:py-6
                  lg:rounded-[24px]
                  lg:px-8
                "
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Google Details */}
            <div className="flex items-center gap-4">
              <div
                className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#7a231d]/15
                        bg-white
                        text-lg
                        font-bold
                        text-[#4285F4]
                      "
              >
                G
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#221a16]">
                  Al-Arafa Restaurant
                </h3>

                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex gap-0.5 text-[#7a231d]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={13}
                        strokeWidth={0}
                        fill="currentColor"
                      />
                    ))}
                  </div>

                  <span className="text-xs font-semibold text-[#6b6058]">
                    4.8
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-[#6b6058] sm:text-xs">
                  Based on 1502 reviews · powered by Google
                </p>
              </div>
            </div>

            {/* Google CTA */}

            <button
              type="button"
              onClick={() =>
                window.open(
                  "https://www.google.com/search?q=al+arafa+Cuisine+google+reviews+singapore&sca_esv=444dee17e46a57e2&sxsrf=APpeQntHxHEJwFxfIDTKponEWW9mhPSrCA%3A1788944372367&ei=9B-havaKFv2ohvcPtsazGA&biw=1920&bih=953&oq=al+arafa+Cuisine+google+reviews+sing&gs_lp=Egxnd3Mtd2l6LXNlcnAiI2FsIGFyYWZhIGN1c2luZSBnb29nbGUgcmV2aWV3cyBzaW5nKgIIADIHECEYChigATIHECEYChigATIHECEYChigAUjsLFCkCFi8HnABeAGQAQCYAcQBoAGfB6oBAzAuNbgBA8gBAPgBAZgCBKACvATCAgoQABhHGNYEGLADwgIEECEYFZgDAOIDBRIBMSBAiAYBkAYIkgcFMS4yLjGgB74OsgcFMC4yLjG4B7AEwgcHMC4xLjIuMcgHEoAIAQ&sclient=gws-wiz-serp#lrd=0x31da195bfbe3fee9:0x8e53aa0db7e5f3dc,1",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              className="
                             mt-5
                             rounded-full
                             bg-[#7a231d]
                             px-6
                             py-3
                             text-sm
                             font-semibold
                             text-white
                             shadow-md
                             transition-all
                             duration-300
                             hover:-translate-y-0.5
                             hover:bg-[#5c1b16]
                             hover:shadow-lg
                           "
            >
              ★ Review us on Google
            </button>
          </div>
        </div>

        {/*  LOCATION & HOURS */}

        <section className="w-full bg-[#f7f1e6] px-5 py-16 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="mx-auto max-w-[1500px]">
            {/* Heading */}
            <div className="mt-6 flex w-full flex-col items-center text-center sm:mt-8 lg:mt-10">
              {/* Eyebrow */}
              <div className="mb-2.5 flex items-center justify-center gap-2.5 text-[9px] font-semibold tracking-[0.18em] text-[#a9812f] sm:mb-3 sm:gap-3 sm:text-[10px] sm:tracking-[0.2em] lg:text-[11px] lg:tracking-[0.22em]">
               

                <span>WE'D LOVE TO SEE YOU</span>

               
              </div>

              {/* Heading */}
              <h2 className="mb-3 max-w-[320px] font-serif text-2xl font-bold leading-tight text-[#221a16] sm:mb-4 sm:max-w-none sm:text-3xl lg:mb-5 lg:text-4xl">
                Visit <span className="text-[#7a231d]">Al-Arafa</span>
              </h2>
            </div>

            {/* Main Grid */}
            <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
              {/*  MAP */}
              <div className="relative min-h-[380px] overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] sm:min-h-[460px] lg:min-h-[500px]">
                <iframe
                  title="Al-Arafa Restaurant Location"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    address,
                  )}&output=embed`}
                  className="absolute inset-0 h-full w-full border-0 grayscale-[0.7]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                {/* Map overlay */}
                <div className="pointer-events-none absolute inset-0 bg-[#f7f1e6]/5" />

                {/* Directions Button */}
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                absolute
                bottom-5
                left-5
                right-5
                flex
                items-center
                justify-center
                gap-2
                rounded-full
                bg-[#7a231d]
                px-6
                py-4
                text-sm
                font-medium
                uppercase
                tracking-[0.12em]
                text-white
                shadow-lg
                transition-all
                duration-300
                hover:bg-[#5c1b16]
                hover:shadow-xl
                sm:left-auto
                sm:right-5
                sm:w-auto
              "
                >
                  Get Directions
                  <ArrowUpRight size={17} strokeWidth={1.8} />
                </a>
              </div>

              {/*  CONTACT */}
              <div className="flex flex-col justify-between rounded-[24px] border border-black/5 bg-white p-7 shadow-[0_10px_40px_rgba(0,0,0,0.04)] sm:p-9 lg:p-10">
                <div>
                  <div className="mb-8">
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-[#7a231d]">
                      Get In Touch
                    </p>

                    <h3 className="font-serif text-3xl text-[#221a16] sm:text-4xl">
                      We'd love to hear from you.
                    </h3>
                  </div>

                  {/* Contact Items */}
                  <div className="divide-y divide-black/10">
                    {/* Phone */}
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="group flex items-center gap-5 py-5 first:pt-0"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#7a231d]/10 text-[#7a231d] transition-colors group-hover:bg-[#7a231d] group-hover:text-white">
                        <Phone size={20} strokeWidth={1.7} />
                      </div>

                      <div>
                        <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[#221a16]/45">
                          Phone
                        </p>
                        <p className="text-base font-medium text-[#221a16]">
                          {phone}
                        </p>
                      </div>
                    </a>

                    {/* Email */}
                    <a
                      href={`mailto:${email}`}
                      className="group flex items-center gap-5 py-5"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#7a231d]/10 text-[#7a231d] transition-colors group-hover:bg-[#7a231d] group-hover:text-white">
                        <Mail size={20} strokeWidth={1.7} />
                      </div>

                      <div className="min-w-0">
                        <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[#221a16]/45">
                          Email
                        </p>
                        <p className="truncate text-base font-medium text-[#221a16]">
                          {email}
                        </p>
                      </div>
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-5 py-5"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#7a231d]/10 text-[#7a231d] transition-colors group-hover:bg-[#7a231d] group-hover:text-white">
                        <MessageCircle size={20} strokeWidth={1.7} />
                      </div>

                      <div>
                        <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[#221a16]/45">
                          WhatsApp
                        </p>
                        <p className="text-base font-medium text-[#221a16]">
                          Chat with us
                        </p>
                      </div>
                    </a>

                    {/* Address */}
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-5 py-5"
                    >
                      {" "}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#7a231d]/10 text-[#7a231d] transition-colors group-hover:bg-[#7a231d] group-hover:text-white">
                        <MapPin size={20} strokeWidth={1.7} />
                      </div>
                      <div>
                        <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[#221a16]/45">
                          Address
                        </p>
                        <p className="max-w-sm text-base font-medium leading-6 text-[#221a16]">
                          {address}
                        </p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Bottom message */}
                <div className="mt-8 border-t border-black/10 pt-7">
                  <p className="font-serif text-xl italic text-[#7a231d] sm:text-2xl">
                    Your table is waiting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 
                 FAQ
              */}

        <Faq />

        <div className="h-0" />
        <section className="relative w-full bg-[#f7f1e6] pb-6 sm:pb-8">
          {/* Dotted background */}
          <div />

          {/* Space reserved for the overlapping icon */}
          <div className="relative w-full pt-[85px] sm:pt-[100px] md:pt-[115px] lg:pt-[125px]">
            {/* Full-width blue section */}
            <div
              className="
            relative
            w-full
            bg-[#7a231d]
          "
            >
              {/* Content */}
              <div
                className="
              mx-auto
              flex
              min-h-[250px]
              w-full
              max-w-7xl
              items-center
              px-6
              py-12

              sm:min-h-[270px]
              sm:px-10
              sm:py-14

              md:min-h-[290px]
              md:px-16

              lg:min-h-[310px]
              lg:px-20
            "
              >
                <div
                  className="
    w-full
    max-w-[650px]
    text-left

    px-0
    sm:px-0
  "
                >
                  <h2
                    className="
      max-w-[520px]
      text-[1.75rem]
      font-semibold
      leading-[1.15]
      tracking-[-0.02em]
      text-white

      sm:text-[2.25rem]
      md:text-[2.75rem]
      lg:text-[3.25rem]
      xl:text-[3.5rem]
    "
                  >
                    Every Meal <br /> Served With Love
                  </h2>

                  <p
                    className="
      mt-3
      max-w-[500px]
      text-[0.875rem]
      leading-6
      text-white/80

      sm:mt-4
      sm:text-base
      sm:leading-7

      md:text-[1.05rem]
      md:leading-7
    "
                  >
                    Every cup, every plate, and every moment is served with
                    passion and care.
                  </p>

                  {/* Contact Us */}
                  <Link
                    href="/contact"
                    className="
      mt-5
      inline-block

      sm:mt-6
    "
                  >
                    <button
                      type="button"
                      className="
        rounded-full
        bg-white
        px-6
        py-2.5
        text-sm
        font-semibold
        text-black
        shadow-md
        transition-all
        duration-300

       
       hover:bg-[white]
        hover:text-black
        hover:shadow-lg

        sm:px-8
        sm:py-3
        sm:text-base
      "
                    >
                      Contact Us
                    </button>
                  </Link>
                </div>
              </div>

              {/* Icon */}
              <div
                className="
              absolute
              right-[5%]
              top-0
              z-10
              flex
              h-[150px]
              w-[150px]
              -translate-y-1/2
              items-center
              justify-center
              rounded-full

              bg-[#f7f1e6]

              sm:right-[8%]
              sm:h-[175px]
              sm:w-[175px]

              md:right-[10%]
              md:h-[200px]
              md:w-[200px]

              lg:right-[12%]
              lg:h-[220px]
              lg:w-[220px]
            "
              >
                <img
                  src={logo}
                  alt="Every meal served with love"
                  className="
                h-auto
                w-[85px]

                sm:w-[105px]
                md:w-[125px]
                lg:w-[140px]
              "
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 
          STICKY CART (mirrors Menu page cart behavior)
       */}
      <CartBar />

      {/* 
          LOGIN (mirrors Menu page auth behavior)
       */}
      <LoginSheet
        open={loginSheetOpen}
        onOpenChange={setLoginSheetOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
