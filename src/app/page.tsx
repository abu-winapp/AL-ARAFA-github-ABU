"use client";

import Hero from "./HeroPage";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  ArrowRight,
  CalendarDays,
  ChefHat,
  Flame,
  Heart,
  Leaf,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  ShoppingBag,
  Bike,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  ArrowUpRight,
  ConciergeBell,
  Soup,
  Sandwich,
  Pizza,
  CupSoda,
  Menu,
  Salad,
  CakeSlice,
} from "lucide-react";

import { getCategories, getMenuItems } from "@/lib/api/menu.service";

import type { Category, MenuItem } from "@/types";

import Image from "next/image";
// as of now clicking how would you like to order will navigate to the menu page,
//  but we can change it later

import { useRouter } from "next/navigation";

const herobg = "/images/HeroBg.webp";

const serving = "/images/serving.png";
const alarafa = "/images/AL-ARAFA.png";

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
const dish2 = "/images/dish-2.png";
const dish3 = "/images/dish-3.jpg";
const dish4 = "/images/dish-4.jpg";
const goodfoodbg = "/images/goodfoodbg.png";

const reviewimg1 = "/images/review-beef.jpg";
const reviewimg2 = "/images/review-chickenbriyani.jpg";
const reviewimg3 = "/images/review-dosa.jpg";
const reviewimg4 = "/images/review-meals.jpg";
const reviewimg5 = "/images/review-muttonBriyani.jpg";

const orderWays1 = "/images/dinein.png";
const orderWays2 = "/images/takeaway.png";
const orderWays3 = "/images/delivery.png";

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
  const phone = "+65 1234 5678";
  const email = "hello@alarafa.com";
  const whatsapp = "6512345678";
  const address = "123 Restaurant Street, Singapore";

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address,
  )}`;

  const [selectedMethod, setSelectedMethod] = useState("dine-in");

  const menuCards = [
    {
      title: "Chicken Biryani",
      description: "Aromatic basmati rice with tender chicken & rich spices",
      price: "$13.99",
      image: food1,
      badge: "🔥",
    },
    {
      title: "Chicken Shawarma",
      description: "Juicy grilled chicken with fresh veggies & signature sauce",
      price: "$10.50",
      image: food2,
      badge: "⭐",
    },
    {
      title: "Grilled Chicken",
      description: "Tender marinated chicken grilled to smoky perfection",
      price: "$12.99",
      image: food3,
      badge: "❤️",
    },
    {
      title: "Mixed Grill",
      description: "A generous selection of perfectly grilled meats",
      price: "$16.99",
      image: food1,
      badge: "🔥",
    },
  ];
  const trustCards = [
    {
      title: "Google Rating",
      description:
        "Loved by our customers for our authentic taste, quality ingredients, and delicious food.",
      icon: img1,
    },
    {
      title: "50K+ Happy Customers",
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
    {
      image: Trust4,
      title: "Made Fresh Daily",
      description: "Freshly prepared every day for better taste.",
    },
    {
      image: Trust5,
      title: "Authentic Recipes",
      description: "Traditional recipes made with authentic flavours.",
    },
    {
      image: Trust6,
      title: "No Preservatives",
      description: "Good food made without unnecessary preservatives.",
    },
  ];

  const dishes = [
    {
      image: dish1,
      title: "Hyderabadi Chicken Biryani",
      description:
        "A royal blend of basmati rice, tender chicken and aromatic spices.",
      price: "S$399",
      badge: "🔥",
    },
    {
      image: dish2,
      title: "Mutton Seekh Kebab",
      description:
        "Juicy minced mutton, blended with spices and slow grilled to perfection.",
      price: "S$299",
      badge: "★",
    },
    {
      image: dish3,
      title: "Butter Chicken",
      description:
        "Succulent chicken simmered in a rich, creamy tomato-based gravy.",
      price: "S$349",
      badge: "🌿",
    },
    {
      image: dish4,
      title: "Paneer Tikka Masala",
      description:
        "Grilled cottage cheese cubes cooked in a spiced, creamy masala sauce.",
      price: "S$279",
      badge: "🌿",
    },
  ];

  const orderOptions = [
    {
      title: "Self Collect",
      description: "Order ahead and collect when ready.",
      icon: ShoppingBag,
      type: "pickup",
      available: true,
    },
    {
      title: "Delivery",
      description: "Enjoy your favourites at your doorstep.",
      icon: Bike,
      type: "delivery",
      available: true,
    },
    {
      title: "Dine In",
      description: "Come in and enjoy freshly prepared food.",
      icon: Utensils,
      type: "dine-in",
      available: true,
    },
  ];

  const router = useRouter();

  const handleOrder = (type: string) => {
    router.push(`/menu?orderType=${type}`);
  };

  // ---- Hero plate slideshow ----
  // 5 dishes, changing every ~4s with a clockwise rotate-in transition.
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

  // const foodCategories = [
  //   { label: "Main Course", icon: ConciergeBell },
  //   { label: "Biryani", icon: Soup },
  //   { label: "Burgers", icon: Sandwich },
  //   { label: "Pizza", icon: Pizza },
  //   { label: "Beverages", icon: CupSoda },
  //   { label: "Desserts", icon: CakeSlice },
  //   { label: "Starters", icon: Utensils },
  //   { label: "Salads", icon: Salad },
  // ];

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

  const MenuCard = ({
    image,
    title,
    description,
    price,
    badge,
  }: {
    image: string;
    title: string;
    description: string;
    price: string;
    badge?: string;
  }) => {
    return (
      <div className="group flex h-[126px] w-full overflow-hidden rounded-[17px] bg-[#fffaf2] p-3 shadow-[0_5px_18px_rgba(70,45,25,0.10)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(70,45,25,0.16)]">
        {/* Image */}
        <div className="relative h-full w-[112px] shrink-0 overflow-hidden rounded-[12px]">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />

          {/* Badge */}
          {badge && (
            <div className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#fffaf2] text-[13px] shadow-md">
              {badge}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between pl-3">
          {/* Title + Description */}
          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-bold leading-5 text-[#211a16]">
              {title}
            </h3>

            <p className="mt-1 line-clamp-2 text-[12px] leading-[1.4] text-[#5b514a]">
              {description}
            </p>
          </div>

          {/* Price + Add */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[16px] font-bold text-[#92251c]">
              {price}
            </span>

            <button
              type="button"
              className="group/cart flex items-center gap-1.5 rounded-full px-1 py-1 text-[12px] font-semibold text-[#92251c] transition-all duration-200 hover:bg-[#92251c]/8"
            >
              <span>Add</span>

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-[17px] w-[17px] transition-transform duration-200 group-hover/cart:scale-110"
              >
                <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L21 8H6" />
                <circle cx="10" cy="20" r="1.3" />
                <circle cx="18" cy="20" r="1.3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="home-page">
        {/* MAIN SECTION */}
        <section className="text-[#202020]">
          {/* hero */}

          <Hero />

          {/* FOOD CATEGORIES */}
          <section className="w-full overflow-hidden bg-[#f5eee3] px-4 pb-16 pt-2 sm:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1280px] lg:max-w-[1400px] xl:max-w-[1500px] 2xl:max-w-[1650px]">
              {/* Section Heading */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-2.5 flex items-center justify-center gap-2.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#B08D3E] sm:mb-3 sm:gap-3 sm:text-[10px] lg:text-[11px] lg:tracking-[0.22em]">
                  <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />

                  <span>FOOD CATEGORIES</span>

                  <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />
                </div>

                <h2 className="font-serif text-2xl font-bold leading-tight text-[#1d1d1d] sm:text-3xl lg:text-4xl">
                  Flavours for{" "}
                  <span className="text-[#92251c]">Every Craving</span>
                </h2>
              </div>

              {/* Category Slider arrow for desktop and swipe hide the arrow for mobile and tabs */}

              {/* Category Slider */}
              <div
                ref={categoryScrollRef}
                className="flex w-full gap-5 overflow-x-auto pb-4 scrollbar-hide"
                role="tablist"
                aria-label="Menu categories"
              >
                {categories.map((category) => {
                  const items = groupedItems[category.id]?.items ?? [];

                  const imageUrl =
                    category.imageUrl ||
                    items.find((item) => item.imageUrl)?.imageUrl;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      role="tab"
                      onClick={() => scrollToCategory(category.id)}
                      className="
          group flex w-[110px] shrink-0 flex-col
          items-center gap-2
          rounded-2xl
          bg-white
          text-center
          transition-all duration-300
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#92251c]
          focus-visible:ring-offset-2
        "
                    >
                      {/* Category Image */}
                      <div
                        className="
    mt-2
    h-[72px] w-[72px]
    shrink-0 overflow-hidden
    rounded-full
    bg-[#faf7f2]
    ring-2 ring-[#EADFC9]
    transition-all duration-300
  "
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt=""
                            loading="lazy"
                            className="
                h-full w-full
                object-cover
                transition-transform duration-500
                group-hover:scale-110
              "
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-xl font-bold text-[#92251c]">
                              {category.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Category Name */}
                      <span
                        className="
            w-full
            line-clamp-2
            text-sm font-semibold
            leading-5
            text-[#1d1d1d]
            transition-colors duration-300
            group-hover:text-[#92251c]
          "
                      >
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* most ordered dishes */}

          <section className="w-full bg-[#f5eee3] px-4 py-14 sm:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1280px] lg:max-w-[1400px] xl:max-w-[1500px] 2xl:max-w-[1650px]">
              {/*  HEADER  */}

              <div className="mb-3 flex items-center justify-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-[#B08D3E]">
                <span className="h-px w-7 bg-[#C9A24B]" />
                MOST ORDERED
                <span className="h-px w-7 bg-[#C9A24B]" />
              </div>

              <h2 className="mb-4 text-center font-serif text-2xl font-bold text-[#1d1d1d] sm:mb-5 sm:text-3xl lg:mb-6">
                Our Most-Craved{" "}
                <span className="text-[#92251c]">Favourites</span>
              </h2>

              {/* Menu Cards */}

              <div className="relative z-20 pb-8 sm:pb-10 lg:pb-6">
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                  {menuCards.map((card, index) => (
                    <MenuCard key={index} {...card} />
                  ))}
                </div>
              </div>

              {/* signature dishes header */}
              <div className="mt-6 flex w-full flex-col items-center text-center sm:mt-8 lg:mt-10">
                {/* Eyebrow */}
                <div className="mb-2.5 flex items-center justify-center gap-2.5 text-[9px] font-semibold tracking-[0.18em] text-[#B08D3E] sm:mb-3 sm:gap-3 sm:text-[10px] sm:tracking-[0.2em] lg:text-[11px] lg:tracking-[0.22em]">
                  <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />

                  <span>AL-ARAFA SPECIAL</span>

                  <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />
                </div>

                {/* Heading */}
                <h2 className="mb-3 max-w-[320px] font-serif text-2xl font-bold leading-tight text-[#1d1d1d] sm:mb-4 sm:max-w-none sm:text-3xl lg:mb-5 lg:text-4xl">
                  Our Signature.{" "}
                  <span className="text-[#92251c]">Your Next Craving.</span>
                </h2>
              </div>

              {/* SPACING BETWEEN SECTIONS */}
              <div className="h-8 sm:h-10 lg:h-12" />

              {/*  DISH CARDS for signature dishes  */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {dishes.map((dish, index) => (
                  <div
                    key={index}
                    className="group overflow-hidden rounded-[17px] bg-[#fffaf2] shadow-[0_5px_18px_rgba(70,45,25,0.10)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(70,45,25,0.16)]"
                  >
                    {/* Image */}
                    <div className="relative p-3 pb-0">
                      <div className="relative aspect-[1.65/1] overflow-hidden rounded-[12px]">
                        <img
                          src={dish.image}
                          alt={dish.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />

                        {/* Badge */}
                        <div className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#fffaf2] text-[17px] shadow-md">
                          {dish.badge}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-3.5 pb-4 pt-3">
                      <h3 className="text-[18px] font-bold leading-6 text-[#211a16]">
                        {dish.title}
                      </h3>

                      <p className="mt-1.5 min-h-[48px] text-[14px] leading-[1.45] text-[#5b514a]">
                        {dish.description}
                      </p>

                      {/* Bottom */}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[19px] font-bold text-[#a02f2f]">
                          {dish.price}
                        </span>

                        <button className="group/cart flex items-center gap-2 text-[14px] font-semibold text-[#9c3030] transition-colors hover:text-[#7e2020]">
                          <span>Add to Cart</span>

                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-[20px] w-[20px] transition-transform duration-200 group-hover/cart:scale-110"
                          >
                            <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L21 8H6" />
                            <circle cx="10" cy="20" r="1.3" />
                            <circle cx="18" cy="20" r="1.3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex w-full flex-col items-center text-center sm:mt-8 lg:mt-10">
                {/* Eyebrow */}
                <div className="mb-2.5 flex items-center justify-center gap-2.5 text-[9px] font-semibold tracking-[0.18em] text-[#B08D3E] sm:mb-3 sm:gap-3 sm:text-[10px] sm:tracking-[0.2em] lg:text-[11px] lg:tracking-[0.22em]">
                  <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />

                  <span>MUST TRY</span>

                  <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />
                </div>

                {/* Heading */}
                <h2 className="mb-3 max-w-[320px] font-serif text-2xl font-bold leading-tight text-[#1d1d1d] sm:mb-4 sm:max-w-none sm:text-3xl lg:mb-5 lg:text-4xl">
                  Don't Leave Without{" "}
                  <span className="text-[#92251c]">Trying These!</span>
                </h2>
              </div>

              {/*  DISH CARDS 1 */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {dishes.map((dish, index) => (
                  <div
                    key={index}
                    className="group overflow-hidden rounded-[17px] bg-[#fffaf2] shadow-[0_5px_18px_rgba(70,45,25,0.10)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(70,45,25,0.16)]"
                  >
                    {/* Image */}
                    <div className="relative p-3 pb-0">
                      <div className="relative aspect-[1.65/1] overflow-hidden rounded-[12px]">
                        <img
                          src={dish.image}
                          alt={dish.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />

                        {/* Badge */}
                        <div className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#fffaf2] text-[17px] shadow-md">
                          {dish.badge}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-3.5 pb-4 pt-3">
                      <h3 className="text-[18px] font-bold leading-6 text-[#211a16]">
                        {dish.title}
                      </h3>

                      <p className="mt-1.5 min-h-[48px] text-[14px] leading-[1.45] text-[#5b514a]">
                        {dish.description}
                      </p>

                      {/* Bottom */}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[19px] font-bold text-[#a02f2f]">
                          {dish.price}
                        </span>

                        <button className="group/cart flex items-center gap-2 text-[14px] font-semibold text-[#9c3030] transition-colors hover:text-[#7e2020]">
                          <span>Add to Cart</span>

                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-[20px] w-[20px] transition-transform duration-200 group-hover/cart:scale-110"
                          >
                            <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L21 8H6" />
                            <circle cx="10" cy="20" r="1.3" />
                            <circle cx="18" cy="20" r="1.3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/*  AMBIENCE  */}
              <div className="mt-8 overflow-hidden rounded-[17px] bg-[#1d2a1d]">
                <div className="grid min-h-[305px] grid-cols-1 lg:grid-cols-2">
                  {/* Left */}
                  <div className="relative flex flex-col justify-center overflow-hidden px-8 py-10 sm:px-12 lg:px-[70px]">
                    {/* Decorative leaf */}
                    <div className="pointer-events-none absolute -bottom-16 right-0 opacity-20">
                      <svg
                        viewBox="0 0 220 300"
                        className="h-[280px] w-[210px]"
                        fill="none"
                      >
                        <path
                          d="M105 300C110 230 125 145 180 55"
                          stroke="white"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M126 205C95 178 75 150 62 118C94 126 118 151 126 205Z"
                          stroke="white"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M143 165C116 139 104 112 101 82C128 96 143 124 143 165Z"
                          stroke="white"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M109 245C74 226 49 199 37 165C72 177 98 203 109 245Z"
                          stroke="white"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M157 119C145 91 147 63 158 37C177 59 175 91 157 119Z"
                          stroke="white"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M92 270C62 265 35 247 17 219C48 219 76 237 92 270Z"
                          stroke="white"
                          strokeWidth="1.2"
                        />
                      </svg>
                    </div>

                    <div className="relative z-10">
                      {/* Label */}
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-[15px] text-[#e6bd67]">✦</span>

                        <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#d8b86a]">
                          Ambience
                        </span>
                      </div>

                      <h3 className="max-w-[500px] text-[28px] font-bold leading-[1.2] text-[#f7f0e5] sm:text-[31px]">
                        Good Food. Great Ambience.
                        <br />
                        Unforgettable Moments.
                      </h3>

                      <p className="mt-3 max-w-[480px] text-justify text-[14px] leading-6 text-[#d4d0c7] sm:text-[15px]">
                        Step into a warm and welcoming space where every detail
                        is designed for your comfort and delight.
                      </p>

                      <button className="group mt-6 flex w-fit items-center gap-4 rounded-full border border-[#d4ad55] px-5 py-2.5 text-[13px] font-medium text-[#e2bd6c] transition-all duration-300 hover:bg-[#d4ad55] hover:text-[#1d2a1d]">
                        <span>Explore Our Space</span>

                        <span className="text-[19px] transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Right Image */}
                  <div className="relative min-h-[260px] overflow-hidden lg:min-h-full">
                    <img
                      src={goodfoodbg}
                      alt="Restaurant ambience"
                      className="absolute inset-0 h-full w-full object-cover"
                    />

                    {/* Subtle overlay */}
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>

        {/* Trust Section */}
        <section className="bg-[#f5eee3] px-5 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1280px] lg:max-w-[1400px] xl:max-w-[1500px] 2xl:max-w-[1650px]">
            <div className="mt-6 flex w-full flex-col items-center text-center sm:mt-8 lg:mt-10">
              {/* Eyebrow */}
              <div className="mb-2.5 flex items-center justify-center gap-2.5 text-[9px] font-semibold tracking-[0.18em] text-[#B08D3E] sm:mb-3 sm:gap-3 sm:text-[10px] sm:tracking-[0.2em] lg:text-[11px] lg:tracking-[0.22em]">
                <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />

                <span>WHY CHOOSE US</span>

                <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />
              </div>

              {/* Heading */}
              <h2 className="mb-3 max-w-[320px] font-serif text-2xl font-bold leading-tight text-[#1d1d1d] sm:mb-4 sm:max-w-none sm:text-3xl lg:mb-5 lg:text-4xl">
                Trusted By <span className="text-[#92251c]">Thousands</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {trustCards.map((card, index) => {
                const cardColors = [
                  "#0F5C4D", // Silk Green
                  "#123B66", // Sapphire Blue
                  "#C9A227", // Champagne Gold
                  "#8B1E2D", // Burgundy Red
                ];

                const bgColor = cardColors[index % cardColors.length];

                return (
                  <div
                    key={index}
                    style={{ backgroundColor: bgColor }}
                    className="group relative h-[390px] overflow-hidden rounded-[22px] border border-white/20 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(20,20,20,0.18)]"
                  >
                    {/* Soft background glow */}
                    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-all duration-700 group-hover:bg-white/20" />

                    {/* Card Content */}
                    <div className="relative z-20 p-7 lg:p-8">
                      {/* Small index */}
                      <div className="mb-5 flex items-center gap-3">
                        <span className="text-[11px] font-medium tracking-[0.2em] text-white/70">
                          0{index + 1}
                        </span>
                      </div>

                      <h3 className="max-w-[280px] text-[25px] font-semibold leading-[1.08] tracking-[-0.02em] text-white lg:text-[27px]">
                        {card.title}
                      </h3>

                      <p className="mt-4 max-w-[285px] text-[14px] leading-[1.7] text-white/75">
                        {card.description}
                      </p>
                    </div>

                    {/* Image area */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 h-[215px]">
                      {/* Image fade */}
                      <div className="absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-transparent to-transparent" />

                      <div className="absolute inset-0 flex items-end justify-center">
                        <img
                          src={card.icon}
                          alt={card.title}
                          className="h-[215px] w-full object-contain object-bottom transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                    </div>

                    {/* Bottom subtle gradient */}
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-20 bg-gradient-to-t from-black/15 to-transparent" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* trust and quality */}
        <section className="relative w-full overflow-hidden bg-[#F5F1E8]">
          {/* Very subtle background texture */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.10]"
            style={{
              backgroundImage: "url('/images/trust-bg.jpg')",
            }}
          />

          {/* Soft vignette */}
          <div className="absolute inset-0 bg-[#f5f1e8]/20" />

          {/* Responsive Full-Width Container */}
          <div
            className="relative mx-auto w-full max-w-[1280px] px-6 py-20
                  sm:px-10 sm:py-24
                  lg:max-w-[1400px] lg:px-12 lg:py-28
                  xl:max-w-[1500px] xl:px-16 xl:py-32
                  2xl:max-w-[1650px] 2xl:px-20 2xl:py-36"
          >
            {/* Header */}
            <div className="mt-6 flex w-full flex-col items-center text-center sm:mt-8 lg:mt-10">
              {/* Eyebrow */}
              <div className="mb-2.5 flex items-center justify-center gap-2.5 text-[9px] font-semibold tracking-[0.18em] text-[#B08D3E] sm:mb-3 sm:gap-3 sm:text-[10px] sm:tracking-[0.2em] lg:text-[11px] lg:tracking-[0.22em]">
                <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />

                <span>QUALITY YOU CAN TASTE</span>

                <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />
              </div>

              {/* Heading */}
              <h2 className="mb-3 max-w-[320px] font-serif text-2xl font-bold leading-tight text-[#1d1d1d] sm:mb-4 sm:max-w-none sm:text-3xl lg:mb-5 lg:text-4xl">
                Our Promise of <span className="text-[#92251c]">Quality</span>
              </h2>
            </div>

            {/* Trust Items */}
            <div
              className="mx-auto mt-12 grid w-full grid-cols-1
                    sm:mt-14 sm:grid-cols-2
                    lg:mt-16 lg:grid-cols-3
                    xl:mt-20
                    2xl:mt-24"
            >
              {trustItems.map((item) => (
                <div
                  key={item.title}
                  className="
            group
            flex
            min-h-[300px]
            flex-col
            items-center
            justify-center
            px-8
            py-12
            text-center

            sm:min-h-[320px]
            sm:px-10

            lg:min-h-[340px]
            lg:px-12

            xl:min-h-[360px]
            xl:px-16

            2xl:min-h-[390px]
            2xl:px-20
          "
                >
                  {/* Icon */}
                  <div
                    className="
              flex h-[105px] w-[105px]
              items-center justify-center

              sm:h-[115px] sm:w-[115px]

              lg:h-[125px] lg:w-[125px]

              xl:h-[135px] xl:w-[135px]

              2xl:h-[150px] 2xl:w-[150px]
            "
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="
                h-full
                w-full
                object-contain
                opacity-90
                transition-all
                duration-700
                ease-out
                group-hover:scale-105
                group-hover:opacity-100
              "
                    />
                  </div>

                  {/* Title */}
                  <h3
                    className="
              mt-7
              font-serif
              text-[19px]
              font-medium
              tracking-tight
              text-[#171717]

              sm:text-xl

              lg:mt-8
              lg:text-[21px]

              xl:mt-9
              xl:text-[23px]

              2xl:mt-10
              2xl:text-[25px]
            "
                  >
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="
              mt-3
              max-w-[230px]
              text-[13px]
              leading-6
              text-neutral-500

              sm:text-sm

              lg:mt-4
              lg:max-w-[260px]

              xl:max-w-[280px]
              xl:text-[15px]
              xl:leading-7

              2xl:max-w-[300px]
              2xl:text-base
              2xl:leading-7
            "
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom statement */}
            <div
              className="
        mt-16
        text-center

        sm:mt-20

        lg:mt-24

        xl:mt-28

        2xl:mt-32
      "
            >
              <p
                className="
          font-serif
          text-base
          italic
          text-[#92251c]/80

          sm:text-lg

          xl:text-xl

          2xl:text-2xl
        "
              >
                "Every meal is prepared with purpose."
              </p>
            </div>
          </div>
        </section>
        {/* Story Telling */}
        <section className="w-full overflow-hidden bg-[#f5eee3]">
          <div className="mt-6 flex w-full flex-col items-center text-center sm:mt-8 lg:mt-10">
            {/* Eyebrow */}
            <div className="mb-2.5 flex items-center justify-center gap-2.5 text-[9px] font-semibold tracking-[0.18em] text-[#B08D3E] sm:mb-3 sm:gap-3 sm:text-[10px] sm:tracking-[0.2em] lg:text-[11px] lg:tracking-[0.22em]">
              <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />

              <span>OUR STORY</span>

              <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />
            </div>

            {/* Heading */}
            <h2 className="mb-3 max-w-[320px] font-serif text-2xl font-bold leading-tight text-[#1d1d1d] sm:mb-4 sm:max-w-none sm:text-3xl lg:mb-5 lg:text-4xl">
              Rooted In <span className="text-[#92251c]">Tradition</span>
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
              <div className="flex min-h-[430px] w-full items-center justify-center bg-[#faf9f6] px-7 py-14 text-center sm:px-12 sm:py-16 md:min-h-0 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
                <div className="max-w-[560px]">
                  <img
                    src={serving}
                    alt="Every meal served with love"
                    className="mx-auto mb-6 h-auto w-[90px] sm:mb-7 sm:w-[110px] lg:w-[120px]"
                  />

                  <span className="mb-4 block text-[11px] font-medium uppercase tracking-[0.3em] text-[#92251c]/70 sm:text-[12px]">
                    Our Story
                  </span>

                  <h2 className="mb-5 font-serif text-[30px] leading-[1.12] text-[#252525] sm:text-[36px] lg:mb-6 lg:text-[44px] xl:text-[46px]">
                    A Tradition Made With Passion
                  </h2>

                  <p className="text-justify font-serif text-[16px] leading-[1.8] text-[#555] sm:text-[17px] lg:text-[18px]">
                    Every dish carries a story of tradition, craftsmanship, and
                    generations of culinary passion. From carefully selected
                    ingredients to the final presentation, we believe every meal
                    deserves to be remembered.
                  </p>

                  <div className="mt-7 flex items-center justify-center lg:mt-8">
                    <span className="h-px w-10 bg-[#92251c]/30 sm:w-12" />
                    <span className="mx-3 text-[15px] text-[#92251c]/70 sm:mx-4 sm:text-[16px]">
                      ✦
                    </span>
                    <span className="h-px w-10 bg-[#92251c]/30 sm:w-12" />
                  </div>
                </div>
              </div>
            </div>

            {/* SPACE BETWEEN STORY ROWS */}
            <div className="h-6 sm:h-8 lg:h-10" />

            {/* Row 2 — Content Left / Image Right */}
            <div className="grid w-full grid-cols-1 overflow-hidden rounded-[24px] md:grid-cols-2 lg:rounded-[28px]">
              {/* Content 2 */}
              <div className="order-2 flex min-h-[430px] w-full items-center justify-center bg-[#f5f3ef] px-7 py-14 text-center sm:px-12 sm:py-16 md:order-1 md:min-h-0 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
                <div className="max-w-[560px]">
                  <img
                    src={serving}
                    alt="Every meal served with love"
                    className="mx-auto mb-6 h-auto w-[90px] sm:mb-7 sm:w-[110px] lg:w-[120px]"
                  />

                  <span className="mb-4 block text-[11px] font-medium uppercase tracking-[0.3em] text-[#92251c]/70 sm:text-[12px]">
                    The Craft
                  </span>

                  <h2 className="mb-5 font-serif text-[30px] leading-[1.12] text-[#252525] sm:text-[36px] lg:mb-6 lg:text-[44px] xl:text-[46px]">
                    Where Every Detail Matters
                  </h2>

                  <p className="text-justify font-serif text-[16px] leading-[1.8] text-[#555] sm:text-[17px] lg:text-[18px]">
                    We bring together timeless techniques and carefully chosen
                    flavours to create an experience that feels both familiar
                    and extraordinary. It is this attention to detail that makes
                    every plate part of our story.
                  </p>

                  <div className="mt-7 flex items-center justify-center lg:mt-8">
                    <span className="h-px w-10 bg-[#92251c]/30 sm:w-12" />
                    <span className="mx-3 text-[15px] text-[#92251c]/70 sm:mx-4 sm:text-[16px]">
                      ✦
                    </span>
                    <span className="h-px w-10 bg-[#92251c]/30 sm:w-12" />
                  </div>
                </div>
              </div>

              {/* Image 2 */}
              <div className="group relative order-1 h-[45vh] min-h-[360px] w-full overflow-hidden md:order-2 md:h-[560px] lg:h-[600px] xl:h-[640px]">
                <Image
                  src={images[1].src}
                  alt={images[1].alt}
                  fill
                  sizes="(max-width: 767px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
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
          <section className="relative w-full overflow-hidden bg-[#faf9f6]">
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
                src={serving}
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
        text-[#252525]
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
                  Inspired by the masterful strokes of Renaissance paintings,
                  where every hue carries not just aesthetic significance but
                  also cultural and symbolic depth. The deep red hues evoke
                  passion, sophistication, and a connection to the sacramental
                  significance found in Italian religious art.
                </p>
              </div>

              {/* Bottom ornament */}
              <div className="mt-10 flex flex-col items-center sm:mt-12 lg:mt-14">
                <span
                  className="
          block
          h-12
          w-px
          bg-[#92251c]/20

          sm:h-14
          lg:h-16
        "
                />

                <span
                  className="
          mt-2
          text-[18px]
          text-[#92251c]/65

          sm:text-[20px]
        "
                >
                  ✦
                </span>
              </div>
            </div>
          </section>
        </section>
        {/* CUSTOMER REVIEWS */}
        <CustomerReviews />
        {/* Order Options Section */}
        <section className="bg-[#f5eee3] px-5 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1280px] lg:max-w-[1400px] xl:max-w-[1500px] 2xl:max-w-[1650px]">
            {/* Order Options */}
            <section className="w-full bg-white px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 xl:py-14">
              <div className="mx-auto w-full max-w-[1100px] lg:max-w-[1200px] xl:max-w-[1300px] 2xl:max-w-[1400px]">
                {/* Heading */}
                <div className="mb-7 text-center sm:mb-8 lg:mb-9">
                  <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-[#92251c] sm:text-sm">
                    Order Now
                  </span>

                  <h2 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl lg:text-4xl xl:text-[42px]">
                    Choose How You'd Like
                    <span className="block text-[#92251c]">
                      to Get Your Order
                    </span>
                  </h2>

                  <p className="mx-auto mt-3 max-w-xl text-xs leading-5 text-gray-500 sm:text-sm lg:text-base">
                    Select your preferred ordering method and continue to place
                    your order.
                  </p>
                </div>

                {/* Order Methods */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4 lg:gap-5 xl:gap-6">
                  {orderWays.map((way) => {
                    const isSelected = selectedMethod === way.id;

                    return (
                      <button
                        key={way.id}
                        type="button"
                        onClick={() => setSelectedMethod(way.id)}
                        className={`
              group relative overflow-hidden rounded-2xl border-2
              bg-white text-left transition-all duration-300
              focus:outline-none focus:ring-4 focus:ring-[#92251c]/20 

              ${
                isSelected
                  ? "border-[#92251c] shadow-lg shadow-[#92251c]/15"
                  : "border-gray-100 shadow-sm hover:-translate-y-1 hover:border-[#92251c]/50 hover:shadow-md"
              }
            `}
                      >
                        {/* Image */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 sm:aspect-[4/3] lg:aspect-[16/10]">
                          <img
                            src={way.image}
                            alt={way.title}
                            className={`
                  h-full w-full object-cover
                  transition-transform duration-500
                  group-hover:scale-105
                  ${isSelected ? "scale-105" : ""}
                `}
                          />

                          {/* Selected Overlay */}
                          <div
                            className={`
                  absolute inset-0 bg-[#92251c]/10
                  transition-opacity duration-300
                  ${isSelected ? "opacity-100" : "opacity-0"}
                `}
                          />

                          {/* Check */}
                          <div
                            className={`
                  absolute right-3 top-3
                  flex h-8 w-8 items-center justify-center
                  rounded-full bg-[#92251c] text-white shadow-md
                  transition-all duration-300
                  ${isSelected ? "scale-100 opacity-100" : "scale-75 opacity-0"}
                `}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m5 12 4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 lg:p-5">
                          <div className="flex items-center justify-between gap-2">
                            <h3
                              className={`
                    text-base font-bold transition-colors
                    sm:text-lg lg:text-xl
                    ${isSelected ? "text-[#92251c]" : "text-gray-900"}
                  `}
                            >
                              {way.title}
                            </h3>

                            {/* Radio */}
                            <span
                              className={`
                    flex h-5 w-5 shrink-0 items-center justify-center
                    rounded-full border-2 transition-all
                    ${
                      isSelected
                        ? "border-[#92251c]"
                        : "border-gray-300 group-hover:border-[#92251c]/60"
                    }
                  `}
                            >
                              {isSelected && (
                                <span className="h-2.5 w-2.5 rounded-full bg-[#92251c]" />
                              )}
                            </span>
                          </div>

                          <p className="mt-1.5 text-xs leading-5 text-gray-500 sm:text-sm">
                            {way.description}
                          </p>

                          <div
                            className={`
                  mt-3 text-xs font-semibold transition-colors sm:text-sm
                  ${
                    isSelected
                      ? "text-[#92251c]"
                      : "text-gray-400 group-hover:text-[#92251c]"
                  }
                `}
                          >
                            {isSelected ? "Selected ✓" : "Select this option →"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Continue */}
                <div className="mt-6 flex justify-center lg:mt-7">
                  <button
                    type="button"
                    className="
          w-full rounded-xl
          bg-[#92251c]
          px-7 py-3
          text-sm font-semibold text-white
          shadow-md shadow-[#92251c]/15
          transition-all duration-200
          hover:bg-[#7d1f18]
          hover:shadow-lg
          active:scale-[0.98]
          sm:w-auto sm:min-w-[210px]
        "
                  >
                    Continue with{" "}
                    {orderWays.find((way) => way.id === selectedMethod)?.title}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </section>
        {/*  LOCATION & HOURS — PREMIUM VERSION  */}
        <section className="w-full bg-[#F5F1E8] px-5 py-16 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="mx-auto max-w-[1500px]">
            {/* Heading */}
            <div className="mt-6 flex w-full flex-col items-center text-center sm:mt-8 lg:mt-10">
              {/* Eyebrow */}
              <div className="mb-2.5 flex items-center justify-center gap-2.5 text-[9px] font-semibold tracking-[0.18em] text-[#B08D3E] sm:mb-3 sm:gap-3 sm:text-[10px] sm:tracking-[0.2em] lg:text-[11px] lg:tracking-[0.22em]">
                <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />

                <span>WE'D LOVE TO SEE YOU</span>

                <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />
              </div>

              {/* Heading */}
              <h2 className="mb-3 max-w-[320px] font-serif text-2xl font-bold leading-tight text-[#1d1d1d] sm:mb-4 sm:max-w-none sm:text-3xl lg:mb-5 lg:text-4xl">
                Visit <span className="text-[#92251c]">Al-Arafa</span>
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
                <div className="pointer-events-none absolute inset-0 bg-[#F5F1E8]/5" />

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
                bg-[#92251C]
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
                hover:bg-[#7d1f18]
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
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-[#92251C]">
                      Get In Touch
                    </p>

                    <h3 className="font-serif text-3xl text-[#1E1B18] sm:text-4xl">
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
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#92251C]/10 text-[#92251C] transition-colors group-hover:bg-[#92251C] group-hover:text-white">
                        <Phone size={20} strokeWidth={1.7} />
                      </div>

                      <div>
                        <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[#1E1B18]/45">
                          Phone
                        </p>
                        <p className="text-base font-medium text-[#1E1B18]">
                          {phone}
                        </p>
                      </div>
                    </a>

                    {/* Email */}
                    <a
                      href={`mailto:${email}`}
                      className="group flex items-center gap-5 py-5"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#92251C]/10 text-[#92251C] transition-colors group-hover:bg-[#92251C] group-hover:text-white">
                        <Mail size={20} strokeWidth={1.7} />
                      </div>

                      <div className="min-w-0">
                        <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[#1E1B18]/45">
                          Email
                        </p>
                        <p className="truncate text-base font-medium text-[#1E1B18]">
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
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#92251C]/10 text-[#92251C] transition-colors group-hover:bg-[#92251C] group-hover:text-white">
                        <MessageCircle size={20} strokeWidth={1.7} />
                      </div>

                      <div>
                        <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[#1E1B18]/45">
                          WhatsApp
                        </p>
                        <p className="text-base font-medium text-[#1E1B18]">
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
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#92251C]/10 text-[#92251C] transition-colors group-hover:bg-[#92251C] group-hover:text-white">
                        <MapPin size={20} strokeWidth={1.7} />
                      </div>

                      <div>
                        <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[#1E1B18]/45">
                          Address
                        </p>
                        <p className="max-w-sm text-base font-medium leading-6 text-[#1E1B18]">
                          {address}
                        </p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Bottom message */}
                <div className="mt-8 border-t border-black/10 pt-7">
                  <p className="font-serif text-xl italic text-[#92251C] sm:text-2xl">
                    Your table is waiting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="h-0" />
        <section className="relative w-full bg-[#F5F1E8] pb-6 sm:pb-8">
          {/* Dotted background */}
          <div />

          {/* Space reserved for the overlapping icon */}
          <div className="relative w-full pt-[85px] sm:pt-[100px] md:pt-[115px] lg:pt-[125px]">
            {/* Full-width blue section */}
            <div
              className="
            relative
            w-full
            bg-[#92251C]
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
              "
                >
                  <h2
                    className="
                  text-2xl
                  font-semibold
                  leading-tight
                  text-white

                  sm:text-3xl
                  md:text-4xl
                  lg:text-5xl
                "
                  >
                    Every Meal Served With Love
                  </h2>

                  <p
                    className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-6
                  text-white/80

                  sm:text-base
                  sm:leading-7
                  md:text-lg
                "
                  >
                    Every cup, every plate, and every moment is served with
                    passion and care.
                  </p>

                  {/* Contact Us */}
                  <Link href="/contact">
                    <button
                      type="button"
                      className="
      mt-6
      rounded-full
      bg-[white]
      px-7
      py-3
      text-sm
      font-semibold
      text-black
      shadow-md
      transition-all
      duration-300
      hover:-translate-y-0.5
      hover:bg-[#e9272c]
      hover:shadow-lg

      sm:px-8
      sm:py-3.5
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

              bg-[#F5F1E8]

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
                  src={serving}
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
    </>
  );
}

/* 
   CUSTOMER REVIEWS
 */

type CustomerReview = {
  id: number;
  name: string;
  rating: number;
  text: string;
  date: string;
  title?: string;
  role?: string;
};

const customerReviews: CustomerReview[] = [
  {
    id: 1,
    name: "Arun Kumar",
    rating: 5,
    text: "Absolutely loved the biryani. The flavour was amazing and the portion was generous.",
    date: "2 weeks ago",
  },
  {
    id: 2,
    name: "Priya S",
    rating: 5,
    text: "One of the best dining experiences. Everything was fresh, hot and delicious.",
    date: "1 month ago",
  },
  {
    id: 3,
    name: "Rahul M",
    rating: 5,
    text: "The biryani was excellent and the service was really quick. Will definitely order again.",
    date: "1 month ago",
  },
  {
    id: 4,
    name: "Sneha R",
    rating: 4,
    text: "Great food and really good value. The chicken was perfectly cooked.",
    date: "2 months ago",
  },
  {
    id: 5,
    name: "Vijay K",
    rating: 5,
    text: "Amazing taste. This has quickly become one of my favourite restaurants.",
    date: "2 months ago",
  },
];

function CustomerReviews() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement | null>(null);

  const getCircularOffset = (index: number, active: number) => {
    const length = customerReviews.length;
    let offset = index - active;

    if (offset > length / 2) offset -= length;
    if (offset < -length / 2) offset += length;

    return offset;
  };

  const animateToIndex = (nextIndex: number) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setActiveIndex(nextIndex);
  };

  const goNext = () => {
    animateToIndex((activeIndex + 1) % customerReviews.length);
  };

  const goPrevious = () => {
    animateToIndex(
      (activeIndex - 1 + customerReviews.length) % customerReviews.length,
    );
  };

  /*
   * Intro animation
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reviews-heading", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".reviews-carousel", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.08,
        ease: "power3.out",
      });

      gsap.from(".google-review-card", {
        y: 20,
        opacity: 0,
        duration: 0.7,
        delay: 0.18,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /*
   * Carousel positioning
   */
  useEffect(() => {
    const cards = cardsRef.current.filter((card): card is HTMLDivElement =>
      Boolean(card),
    );

    const isMobile = window.innerWidth < 768;

    cards.forEach((card, index) => {
      const offset = getCircularOffset(index, activeIndex);

      const isCurrent = offset === 0;
      const isSide = Math.abs(offset) === 1;

      const moveDistance = isMobile
        ? window.innerWidth * 0.76
        : Math.min(window.innerWidth * 0.34, 470);

      gsap.to(card, {
        xPercent: -50,
        x: offset * moveDistance,

        scale: isCurrent ? 1 : isSide ? 0.9 : 0.78,

        opacity: isCurrent ? 1 : isSide ? 0.45 : 0,

        zIndex: isCurrent ? 30 : isSide ? 20 : 0,

        duration: 0.6,
        ease: "power3.inOut",

        onComplete: () => {
          if (isCurrent) {
            setIsAnimating(false);
          }
        },
      });
    });
  }, [activeIndex]);

  /*
   * Autoplay
   */
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!isAnimating) {
        setActiveIndex((prev) => (prev + 1) % customerReviews.length);
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isAnimating]);

  /*
   * Responsive recalculation
   */
  useEffect(() => {
    const handleResize = () => {
      const cards = cardsRef.current.filter((card): card is HTMLDivElement =>
        Boolean(card),
      );

      const isMobile = window.innerWidth < 768;

      cards.forEach((card, index) => {
        const offset = getCircularOffset(index, activeIndex);

        const isCurrent = offset === 0;
        const isSide = Math.abs(offset) === 1;

        const moveDistance = isMobile
          ? window.innerWidth * 0.76
          : Math.min(window.innerWidth * 0.34, 470);

        gsap.set(card, {
          xPercent: -50,
          x: offset * moveDistance,
          scale: isCurrent ? 1 : isSide ? 0.9 : 0.78,
          opacity: isCurrent ? 1 : isSide ? 0.45 : 0,
          zIndex: isCurrent ? 30 : isSide ? 20 : 0,
        });
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [activeIndex]);

  return (
    <section ref={sectionRef} className="w-full overflow-hidden bg-[#f5eee3]">
      <div className="mx-auto w-full max-w-[1650px] px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-8 lg:py-24 xl:px-10">
        {/* 
          Heading
       */}

        <div className="mt-6 flex w-full flex-col items-center text-center sm:mt-8 lg:mt-10">
          {/* Eyebrow */}
          <div className="mb-2.5 flex items-center justify-center gap-2.5 text-[9px] font-semibold tracking-[0.18em] text-[#B08D3E] sm:mb-3 sm:gap-3 sm:text-[10px] sm:tracking-[0.2em] lg:text-[11px] lg:tracking-[0.22em]">
            <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />

            <span>TESTIMONIALS</span>

            <span className="h-px w-5 bg-[#C9A24B] sm:w-6 lg:w-7" />
          </div>

          {/* Heading */}
          <h2 className="mb-3 max-w-[320px] font-serif text-2xl font-bold leading-tight text-[#1d1d1d] sm:mb-4 sm:max-w-none sm:text-3xl lg:mb-5 lg:text-4xl">
            What Our <span className="text-[#92251c]">Guests Say</span>
          </h2>
        </div>

        {/* 
          Carousel Wrapper
       */}
        <div className="reviews-carousel relative mt-10 sm:mt-12 lg:mt-14">
          {/* Previous */}
          <button
            type="button"
            onClick={goPrevious}
            disabled={isAnimating}
            aria-label="Previous review"
            className="
            absolute
            left-0
            top-1/2
            z-40
            hidden
            h-12
            w-12
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-[#92251c]/20
            bg-[#fffaf3]
            text-[#92251c]
            shadow-[0_8px_30px_rgba(70,40,20,0.08)]
            transition-all
            duration-300
            hover:border-[#92251c]
            hover:bg-[#92251c]
            hover:text-white
            disabled:pointer-events-none
            disabled:opacity-40
            md:flex
            lg:left-2
            xl:left-8
          "
          >
            <ChevronLeft size={19} strokeWidth={1.8} />
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={goNext}
            disabled={isAnimating}
            aria-label="Next review"
            className="
            absolute
            right-0
            top-1/2
            z-40
            hidden
            h-12
            w-12
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-[#92251c]/20
            bg-[#fffaf3]
            text-[#92251c]
            shadow-[0_8px_30px_rgba(70,40,20,0.08)]
            transition-all
            duration-300
            hover:border-[#92251c]
            hover:bg-[#92251c]
            hover:text-white
            disabled:pointer-events-none
            disabled:opacity-40
            md:flex
            lg:right-2
            xl:right-8
          "
          >
            <ChevronRight size={19} strokeWidth={1.8} />
          </button>

          {/* 
  TESTIMONIAL CARDS
*/}
          <div
            className="
    relative
    mx-auto
    h-[520px]
    w-full
    overflow-hidden
    sm:h-[540px]
    md:h-[500px]
    md:overflow-visible
    lg:h-[510px]
  "
          >
            {customerReviews.map((review, index) => {
              const role =
                "role" in review && review.role ? review.role : "Happy Guest";

              const title =
                "title" in review && review.title
                  ? review.title
                  : "A wonderful experience";

              // Match each review with your food images
              const reviewImages = [
                reviewimg1,
                reviewimg2,
                reviewimg3,
                reviewimg4,
                reviewimg5,
              ];

              const image = reviewImages[index % reviewImages.length];

              return (
                <div
                  key={review.id}
                  ref={(element) => {
                    cardsRef.current[index] = element;
                  }}
                  className="
          absolute
          left-1/2
          top-1/2
          w-[calc(100%-16px)]
          max-w-[1050px]
          -translate-x-1/2
          -translate-y-1/2
          sm:w-[94%]
          lg:w-[92%]
        "
                >
                  <article
                    className="
            relative
            grid
            min-h-[500px]
            grid-cols-1
            overflow-hidden
            rounded-[26px]
            border
            border-[#92251c]/10
            bg-[#fffaf3]
            shadow-[0_20px_60px_rgba(70,45,25,0.10)]
            md:min-h-[470px]
            md:grid-cols-[42%_58%]
            lg:rounded-[30px]
          "
                  >
                    {/* 
              LEFT — FOOD IMAGE
         */}
                    <div
                      className="
              relative
              h-[220px]
              overflow-hidden
              md:h-full
            "
                    >
                      <img
                        src={image}
                        alt="Food at Al-Arafa Restaurant"
                        className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                transition-transform
                duration-700
              "
                      />

                      {/* Image overlay */}
                      <div
                        className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black/25
                via-transparent
                to-transparent
              "
                      />

                      {/* Small image label */}
                      <div
                        className="
                absolute
                bottom-5
                left-5
                rounded-full
                border
                border-white/20
                bg-black/25
                px-3
                py-1.5
                text-[9px]
                font-medium
                uppercase
                tracking-[0.16em]
                text-white
                backdrop-blur-md
                md:bottom-6
                md:left-6
              "
                      >
                        Al-Arafa Restaurant
                      </div>
                    </div>

                    {/* 
              RIGHT — REVIEW CONTENT
         */}
                    <div
                      className="
              relative
              flex
              min-w-0
              flex-col
              bg-[#fffaf3]
            "
                    >
                      {/* Decorative glow */}
                      <div
                        className="
                pointer-events-none
                absolute
                -right-20
                -top-20
                h-[240px]
                w-[240px]
                rounded-full
                bg-[#92251c]/[0.035]
                blur-3xl
              "
                      />

                      {/* 
                PROFILE — TOP
             */}
                      <div
                        className="
                relative
                z-10
                flex
                items-center
                justify-between
                gap-4
                px-6
                py-6
                sm:px-8
                sm:py-7
                md:px-9
                md:py-8
                lg:px-10
              "
                      >
                        {/* Profile */}
                        <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
                          {/* Letter Avatar */}
                          <div
                            className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#92251c]
                    text-[16px]
                    font-semibold
                    text-white
                    shadow-[0_5px_18px_rgba(146,37,28,0.18)]
                    sm:h-14
                    sm:w-14
                    sm:text-[18px]
                  "
                          >
                            {review.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Name */}
                          <div className="min-w-0">
                            <h3
                              className="
                      truncate
                      text-[15px]
                      font-semibold
                      tracking-[-0.01em]
                      text-[#201d1a]
                      sm:text-[17px]
                    "
                            >
                              {review.name}
                            </h3>

                            <p
                              className="
                      mt-0.5
                      text-[11px]
                      text-[#8a8178]
                      sm:text-[12px]
                    "
                            >
                              {role}
                            </p>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex shrink-0 items-center gap-1">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              size={16}
                              strokeWidth={0}
                              fill="currentColor"
                              className={
                                starIndex < review.rating
                                  ? "text-[#C9A24B]"
                                  : "text-[#C9A24B]/20"
                              }
                            />
                          ))}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="mx-6 h-px bg-[#92251c]/10 sm:mx-8 md:mx-9 lg:mx-10" />

                      {/* 
                REVIEW — BOTTOM
             */}
                      <div
                        className="
                relative
                z-10
                flex
                flex-1
                flex-col
                justify-center
                px-6
                py-8
                sm:px-8
                sm:py-9
                md:px-9
                md:py-10
                lg:px-10
              "
                      >
                        {/* Eyebrow */}
                        <div className="mb-4 flex items-center gap-2">
                          <span
                            className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-[#92251c]
                    sm:text-[10px]
                  "
                          >
                            Guest feedback
                          </span>
                        </div>

                        {/* Quote */}
                        <div className="relative">
                          {/* Quote mark */}
                          <span
                            className="
                    pointer-events-none
                    absolute
                    -left-1
                    -top-5
                    font-serif
                    text-[55px]
                    leading-none
                    text-[#92251c]/10
                    sm:text-[65px]
                  "
                          >
                            "
                          </span>

                          <h4
                            className="
                    relative
                    max-w-[620px]
                    font-serif
                    text-[24px]
                    font-medium
                    leading-[1.22]
                    tracking-[-0.025em]
                    text-[#201d1a]
                    sm:text-[28px]
                    md:text-[30px]
                    lg:text-[32px]
                  "
                          >
                            {title}
                          </h4>

                          <p
                            className="
                    mt-5
                    max-w-[610px]
                    text-justify
                    text-[14px]
                    leading-7
                    text-[#625a51]
                    sm:text-[15px]
                    sm:leading-7
                    md:text-[16px]
                  "
                          >
                            {review.text}
                          </p>
                        </div>

                        {/* Bottom meta */}
                        <div className="mt-7 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-[#887e73]
                    "
                            >
                              {review.date}
                            </span>
                          </div>

                          {/* Rating text */}
                          <span
                            className="
                    text-[11px]
                    font-semibold
                    tracking-wide
                    text-[#92251c]
                  "
                          >
                            {review.rating}.0 / 5
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>

          {/* 
            Mobile Controls
         */}
          <div className="mt-3 flex items-center justify-center gap-5 md:hidden">
            <button
              type="button"
              onClick={goPrevious}
              disabled={isAnimating}
              aria-label="Previous review"
              className="
              grid
              h-10
              w-10
              place-items-center
              rounded-full
              border
              border-[#92251c]/20
              bg-[#fffaf3]
              text-[#92251c]
              shadow-sm
              transition
              active:scale-95
              disabled:opacity-40
            "
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {customerReviews.map((review, index) => (
                <button
                  key={review.id}
                  type="button"
                  onClick={() => animateToIndex(index)}
                  aria-label={`Go to review ${index + 1}`}
                  className={`
                  h-1.5
                  rounded-full
                  transition-all
                  duration-300
                  ${
                    index === activeIndex
                      ? "w-6 bg-[#92251c]"
                      : "w-1.5 bg-[#92251c]/20"
                  }
                `}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={isAnimating}
              aria-label="Next review"
              className="
              grid
              h-10
              w-10
              place-items-center
              rounded-full
              border
              border-[#92251c]/20
              bg-[#fffaf3]
              text-[#92251c]
              shadow-sm
              transition
              active:scale-95
              disabled:opacity-40
            "
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* 
          Restaurant Name
       */}
        <div className="mt-6 text-center sm:mt-8">
          <p className="text-[13px] font-medium tracking-[0.02em] text-[#574f47]">
            Al-Arafa Restaurant
          </p>
        </div>

        {/* 
          Space Before Google Review Card
       */}
        <div className="h-7 sm:h-9 lg:h-10" />

        {/* 
          Google Reviews
       */}
        <div
          className="
          google-review-card
          mx-auto
          max-w-[880px]
          overflow-hidden
          rounded-[22px]
          border
          border-[#92251c]/15
          bg-[#fffaf3]
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
                border-[#92251c]/15
                bg-white
                text-lg
                font-bold
                text-[#4285F4]
              "
              >
                G
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#201d1a]">
                  Al-Arafa Restaurant
                </h3>

                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex gap-0.5 text-[#92251c]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={13}
                        strokeWidth={0}
                        fill="currentColor"
                      />
                    ))}
                  </div>

                  <span className="text-xs font-semibold text-[#625a51]">
                    4.8
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-[#8a8178] sm:text-xs">
                  Based on 1502 reviews · powered by Google
                </p>
              </div>
            </div>

            {/* Google CTA */}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="
              inline-flex
              h-11
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-[#92251c]
              px-5
              text-[13px]
              font-medium
              text-[#92251c]
              transition-all
              duration-300
              hover:bg-[#92251c]
              hover:text-white
              sm:w-auto
            "
            >
              Review us on Google
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`grid h-14 w-14 place-items-center rounded-full bg-[#f4eee5] ${color}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[16px] font-semibold text-[#383838]">{title}</p>
        <p className="mt-0.5 text-[14px] text-[#666]">{subtitle}</p>
      </div>
    </div>
  );
}

function SpecialtyMenuCard({
  title,
  description,
  price,
  icon: Icon,
  image,
  accent,
}: {
  title: string;
  description: string;
  price: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  image: string;
  accent: "green" | "orange" | "blue";
}) {
  const accentStyles = {
    green: {
      bg: "bg-[#eef0e7]",
      icon: "text-[#607848]",
      button: "bg-[#57763d]",
      price: "text-[#57763d]",
    },
    orange: {
      bg: "bg-[#f8eee8]",
      icon: "text-[#e04b27]",
      button: "bg-[#f0521c]",
      price: "text-[#c44a24]",
    },
    blue: {
      bg: "bg-[#e8f0f7]",
      icon: "text-[#376b9d]",
      button: "bg-[#316a9d]",
      price: "text-[#315f8e]",
    },
  };

  const style = accentStyles[accent];

  return (
    <article
      className={`group flex min-h-[175px] items-center gap-5 rounded-[20px] ${style.bg} p-5 transition duration-300 hover:shadow-xl`}
    >
      <img
        src={image}
        alt={title}
        className="h-[110px] w-[110px] shrink-0 rounded-full object-cover shadow-lg"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Icon size={22} className={style.icon} />
          <h3 className="truncate text-[17px] font-medium text-[#303030]">
            {title}
          </h3>
        </div>

        <p className="mt-2 max-w-[190px] text-[16px] leading-6 text-[#686868]">
          {description}
        </p>

        <p className="mt-3 text-[15px] text-[#666]">
          Starts from{" "}
          <span className={`font-bold ${style.price}`}>{price}</span>
        </p>
      </div>

      <button
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${style.button} text-white transition group-hover:translate-x-1`}
      >
        <ArrowRight size={21} />
      </button>
    </article>
  );
}
