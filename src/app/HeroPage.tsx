"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function HeroPage() {
  const menuicon = "./images/food.svg";
  const heroimage = "./images/restaurant-hero.png";

const heroTexts = [
  {
    first: "Savor authentic",
    second: "royal flavors",
  },
  {
    first: "Taste timeless",
    second: "tradition",
  },
  {
    first: "Feast like",
    second: "royalty",
  },
  {
    first: "Discover refined",
    second: "taste",
  },
  {
    first: "Experience true",
    second: "culinary artistry",
  },
];

  const [activeText, setActiveText] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);

      setTimeout(() => {
        setActiveText((prev) => (prev + 1) % heroTexts.length);
        setIsAnimating(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="
        w-full
        min-h-[70vh]
        px-4
        sm:px-6
        lg:px-8
        xl:px-10
        flex
        items-center
        bg-[#f5eee3]
      "
    >
      {/* MAIN HERO GRID */}
      <div
        className="
          w-full
          max-w-[1500px]
          mx-auto
          grid
          grid-cols-1
          lg:grid-cols-[55%_45%]
          items-center
          gap-4
          sm:gap-8
          lg:gap-10
        "
      >
        {/* LEFT CONTENT */}
        <div
          className="
            w-full
            flex
            flex-col
            justify-center
            items-center
            text-center

            lg:items-start
            lg:text-left
            lg:pr-8
            xl:pr-12

            lg:row-start-1
            lg:col-start-1
          "
        >
          {/* Small Heading */}
          <h2
            className="
              !text-[13px]
              sm:!text-sm
              lg:!text-lg
              uppercase
              tracking-[0.14em]
              sm:tracking-[0.25em]
              whitespace-nowrap
              text-gray-500
              font-medium
              !mt-6
              sm:!mt-1
              !mb-3
              sm:!mb-5
              font-manrope
            "
          >
            Fine Dining Experiences
          </h2>

          {/* Main Heading */}
<h1
  className={`
    text-[2.5rem]
    sm:text-5xl
    md:text-7xl
    lg:text-7xl
    xl:text-8xl
    font-normal
    leading-[0.9]
    tracking-[-0.025em]
    font-cormorant
    max-w-[950px]
    transition-all
    duration-500
    ease-out
    ${isAnimating
      ? "-translate-y-8 opacity-0"
      : "translate-y-0 opacity-100"
    }
  `}
>
  <span
    className="
      block
      bg-gradient-to-r
      from-[#6f1d16]
      via-[#b33a2b]
      to-[#3a0d09]
      bg-clip-text
      text-transparent
    "
  >
    {heroTexts[activeText].first}
  </span>

  <span
    className="
      block
      bg-gradient-to-r
      from-[#3a0d09]
      via-[#92251c]
      to-[#c04a38]
      bg-clip-text
      text-transparent
      italic
    "
  >
    {heroTexts[activeText].second}
  </span>
</h1>

          {/* Luxury Decoration */}
          <div className="aniconofluxury my-1 sm:my-6">
            {/* Design this next */}
          </div>

          {/* Description */}
          <p
            className="
              max-w-[340px]
              sm:max-w-xl
              text-[14px]
              sm:text-base
              lg:text-xl
              leading-[1.55]
              text-gray-500
              font-manrope
              mt-1
              mb-4
              sm:mb-7
            "
          >
            Discover a world of culinary delights and create unforgettable
            memories with every bite.
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div
          className="
            relative
            w-full
            min-h-[240px]
            sm:min-h-[380px]
            lg:min-h-[600px]
            flex
            items-start
            justify-center
            z-20

            -mt-8
            sm:mt-0

            lg:row-start-1
            lg:col-start-2
          "
        >
          <div
            className="
              relative
              w-[110%]
              sm:w-[110%]
              md:w-[115%]
              lg:w-[130%]
              xl:w-[125%]

              h-[250px]
              sm:h-[400px]
              md:h-[470px]
              lg:h-[570px]
              xl:h-[630px]

              overflow-visible
              rounded-2xl
              sm:rounded-3xl
            "
          >
            <img
              src={heroimage}
              alt="Luxury dining"
              className="
                w-full
                h-full
                object-contain
              "
            />
          </div>
        </div>

        {/* MENU BUTTON */}
        <Link
          href="/menu"
          className="
            group
            inline-flex
            w-fit
            items-center
            justify-center
            cursor-pointer
            rounded-[15px]
            bg-[#92251c]
            px-[1em]
            py-[0.65em]
            pl-[0.9em]
            text-[17px]
            sm:text-[20px]
            font-black
            text-white
            transition-all
            duration-200
            active:scale-[0.95]
            hover:bg-[#92251c]

            /* MOBILE */
            mx-auto
            mt-2
            mb-6

            /* DESKTOP */
            lg:mx-0
            lg:mt-0
            lg:mb-10
            lg:row-start-1
            lg:col-start-1
            lg:self-end
          "
        >
          <div
            className="
              transition-transform
              duration-500
              ease-linear
              group-hover:scale-[1.25]
            "
          >
            <img
              src={menuicon}
              alt=""
              className="
                block
                h-[28px]
                w-[28px]
                sm:h-[30px]
                sm:w-[30px]
                origin-center
                transition-all
                duration-500
                ease-in-out
                group-hover:translate-x-[1.2em]
                group-hover:scale-[1.1]
              "
            />
          </div>

          <span
            className="
              ml-[0.3em]
              block
              transition-all
              duration-500
              ease-linear
              group-hover:opacity-0
            "
          >
            MENU
          </span>
        </Link>
      </div>
    </section>
  );
}

export default HeroPage;
