"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/ui-2/button";

import { useSettingsStore } from "@/lib/store/useSettingsStore";

/**
 for navigation bar <SiteHeader />.
 */
export default function Hero() {
  const heroImages = [
    "/images/mandi-1.webp",
    "/images/mandi-2.webp",
    "/images/mandi-3.webp",
  ];

  const [currentImage, setCurrentImage] = useState(0);

  const getOrderWindows = useSettingsStore((state) => state.getOrderWindows);

  const fetchAllSettings = useSettingsStore((state) => state.fetchAllSettings);

  useEffect(() => {
    fetchAllSettings();
  }, [fetchAllSettings]);

  const orderWindows = getOrderWindows();

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-SG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
<section
  className="
    relative isolate
    h-[300px]
    overflow-hidden
    rounded-b-[22px]
    bg-[#221a16]
    text-white

    sm:h-[340px]
    sm:rounded-b-[28px]

    md:h-[370px]

    lg:h-[500px]
    lg:rounded-b-[34px]

    xl:h-[540px]
  "
>
      {/*  BACKGROUND SLIDES  */}
      {heroImages.map((image, index) => (
        <img
          key={image}
          src={image}
          alt="Authentic Al Arafa cuisine"
          width={1600}
          height={1100}
          fetchPriority={index === 0 ? "high" : "auto"}
          className={`
            absolute inset-0 -z-20
            h-full w-full
            object-cover
            object-[62%_center]
            transition-opacity duration-1000 ease-in-out
            ${currentImage === index ? "opacity-100" : "opacity-0"}
          `}
        />
      ))}

      {/*  DARK OVERLAY  */}
      <div
        className="
          absolute inset-0 -z-10
          bg-gradient-to-r
          from-black/85
          via-black/55
          to-black/10
        "
      />

      {/*  BOTTOM GRADIENT  */}
      <div
        className="
          absolute inset-x-0 bottom-0 -z-10
          h-1/2
          bg-gradient-to-t
          from-black/65
          to-transparent
        "
      />

      {/*  HERO CONTAINER  */}
      <div
        className="
          relative z-10
          mx-auto
          flex h-full
          w-full
          max-w-[1500px]
        "
      >
        {/* HERO CONTENT */}
        <div
          className="
    flex flex-1
    items-center
    px-5
    pt-3

    sm:px-8
    sm:pt-0

    lg:px-12
    xl:px-16
  "
        >
          <div className="max-w-[680px] w-full">
            {/* EYEBROW */}
            <div className="mb-3 flex items-center gap-3 sm:mb-4">
              <span
                className="
                  text-[9px]
                  font-semibold
                  tracking-[0.28em]
                  text-white/75

                  sm:text-[10px]

                  lg:text-xs
                "
              >
                Al Arafa Cuisine
              </span>
            </div>

            {/* MAIN HEADING */}
            <h1
              className="
                font-serif
                text-[34px]
                font-semibold
                leading-[0.98]
                tracking-[-0.025em]
                text-[white]
                sm:text-[46px]

                md:text-[52px]

                lg:text-[62px]

                xl:text-[70px]
              "
            >
              Good Food.
              <br />
              <span className="text-[#d8b86a]">Great Mood.</span>
            </h1>

            {/* SUB HEADING */}
            <p
              className="
    mt-3
    max-w-[540px]
    text-[12px]
    leading-5
    text-white/75

    sm:mt-4
    sm:text-[13px]
    sm:leading-6

    lg:mt-4
    lg:text-[15px]
    lg:leading-7
  "
            >
              Experience authentic flavours with Al Arafa Cuisine
              {orderWindows.length > 0 && (
                <>
                  <br />

                  <span className="font-medium text-white">
                    Opening Hours:{" "}
                    {orderWindows.map((window, index) => (
                      <span key={window.name}>
                        {index > 0 && " • "}
                        {formatTime(window.start)} – {formatTime(window.end)}
                      </span>
                    ))}
                  </span>
                </>
              )}
            </p>
            {/* CTA */}
            <div
              className="
    mt-4
    flex
    flex-wrap
    items-center
    gap-3

    sm:mt-5
    sm:gap-4
  "
            >
              {/* ORDER NOW */}
              <Link
                href="/menu"
                className="
      inline-flex
      items-center
      gap-2
      rounded-full
      bg-[#d8b86a]
      px-5
      py-2.5
      text-sm
      font-semibold
      text-[#3d1c12]
      transition
      hover:bg-white

      lg:inline-flex
    "
              >
                Order Now
              </Link>

              {/* CONTACT US */}
              <Link
                href="/contact"
                className="
      hidden
      items-center
      gap-2
      rounded-full
      bg-white
      px-5
      py-2.5
      text-sm
      font-semibold
      text-black
      transition
      hover:bg-[#d8b86a]

      lg:inline-flex
    "
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/*  SLIDER INDICATORS  */}
        <div
          className="
            absolute
            bottom-5
            right-5
            z-20
            flex
            items-center
            gap-2

            sm:bottom-6
            sm:right-8

            lg:right-12

            xl:right-16
          "
        >
          {heroImages.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setCurrentImage(index)}
              className={`
                h-1.5
                rounded-full
                transition-all
                duration-500

                ${currentImage === index ? "w-8 bg-white" : "w-1.5 bg-white/40"}
              `}
            />
          ))}
        </div>

        {/*  SCROLL INDICATOR  */}
        <div
          className="
            absolute
            bottom-5
            left-5
            hidden
            items-center
            gap-3
            text-[8px]
            uppercase
            tracking-[0.3em]
            text-white/50

            sm:flex
            sm:left-8

            lg:left-12

            xl:left-16
          "
        ></div>
      </div>
    </section>
  );
}
