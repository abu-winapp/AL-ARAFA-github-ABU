/**
 * About Us Page
 * Al Arafa Cuisine
 */

import type { Metadata } from "next";
import {
  ArrowUpRight,
  ChefHat,
  Leaf,
  Heart,
  MapPin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - Al Arafa Cuisine",
  description:
    "Discover the story behind Al Arafa Cuisine — bringing together Arabian, North Indian and South Indian flavours in Singapore.",
};

const ABOUT_HERO = "/images/aboutushero.png";

// Replace these with your actual images
const IMAGES = {
  story: "/images/goodfoodbg.png",
  cuisine: "/images/restaurant-1.png",
  chef: "/images/restaurant-2.png",
  ingredients: "/images/Chicken-Biryani.jpg",
  experience: "/images/restaurant-1.png",
};

const RESTAURANT = {
  name: "Al Arafa Cuisine",
  address: "218B Changi Rd, Singapore 419737",

  story:
    "Al Arafa Cuisine began with a simple love for food — and a desire to bring people together around flavours that feel both familiar and unforgettable.",

  storyExtended:
    "Located on Changi Road in Singapore, Al Arafa Cuisine brings together the rich culinary traditions of Arabian, North Indian and South Indian cuisine. Our kitchen is built around carefully selected ingredients, experienced chefs and a deep respect for the flavours that have shaped these cuisines for generations.",

  philosophy:
    "We believe great food is more than what is served on a plate. It is the aroma that welcomes you, the first bite that brings back a memory, and the moments shared around the table with people who matter.",

  experience:
    "Whether you join us for a family meal, a casual gathering with friends or a special occasion, our aim is simple — to make every visit warm, memorable and full of flavour.",
};

const CUISINES = [
  {
    number: "01",
    title: "Arabian",
    description:
      "Rich aromas, carefully balanced spices and generous flavours inspired by the traditions of Arabian cuisine.",
  },
  {
    number: "02",
    title: "North Indian",
    description:
      "Bold spices, slow-cooked dishes and comforting flavours inspired by the diverse culinary traditions of North India.",
  },
  {
    number: "03",
    title: "South Indian",
    description:
      "Authentic South Indian flavours with fragrant spices, traditional preparation and the warmth of home-style cooking.",
  },
];

const VALUES = [
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    description:
      "Every dish begins with carefully selected ingredients chosen for freshness, quality and flavour.",
  },
  {
    icon: ChefHat,
    title: "Experienced Chefs",
    description:
      "Our talented chefs bring experience, care and attention to every preparation that leaves our kitchen.",
  },
  {
    icon: Heart,
    title: "Made With Care",
    description:
      "From preparation to presentation, we believe every detail should reflect our love for good food.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#211716]">

      {/* 
          HERO
       */}

      <section className="relative overflow-hidden bg-[#4d0907] text-white">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${ABOUT_HERO})`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#430705]/95 via-[#650b08]/78 to-[#74100c]/20" />

        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#4d0907]/80 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[500px] w-full max-w-[1650px] items-center px-5 sm:px-6 lg:px-8">

          <div className="max-w-[720px] py-20">

            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f4d27a] sm:text-sm">
              The Story Behind Al Arafa
            </p>

            <h1 className="mt-5 text-[#ffffff] text-5xl font-extrabold leading-[0.94] tracking-[-0.04em] sm:text-6xl md:text-7xl lg:text-[82px]">
              More Than
              <br />
              Just Food.
            </h1>



            <p className="mt-8 max-w-[600px] text-justify text-base leading-8 text-white/85 sm:text-lg">
              A celebration of Arabian, North Indian and South Indian
              flavours, prepared with care and served with genuine
              hospitality.
            </p>

          </div>

        </div>

        {/* Curved bottom */}

        <div className="absolute -bottom-1 left-0 right-0 z-20">

          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="block h-[70px] w-full sm:h-[85px] md:h-[100px]"
            aria-hidden="true"
          >
            <path
              d="
                M0,45
                C180,110 360,115 540,105
                C760,92 890,55 1080,35
                C1230,18 1340,18 1440,0
                L1440,120
                L0,120
                Z
              "
              fill="#faf7f2"
            />
          </svg>

        </div>

      </section>


      {/* 
          INTRO / STORY
       */}

      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-6 lg:px-8 lg:py-28">

        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">

          {/* Image */}

          <div className="relative">

            <div className="aspect-[4/5] overflow-hidden bg-[#e8dfd4]">

              <img
                src={IMAGES.story}
                alt="Al Arafa Cuisine"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              />

            </div>

            {/* Decorative gold frame */}


          </div>


          {/* Content */}

          <div className="max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8c1712]">
              Our Story
            </p>

            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-[#3f0806] sm:text-5xl">
              A love for food,
              <br />
              shared with everyone.
            </h2>

            <p className="mt-7 text-justify text-lg leading-9 text-gray-700">
              {RESTAURANT.story}
            </p>

            <p className="mt-5 text-justify text-base leading-8 text-gray-600">
              {RESTAURANT.storyExtended}
            </p>

            

            <p className="mt-6 text-sm font-medium uppercase tracking-[0.16em] text-[#8c1712]">
              Always We Provide Quality & Tasty Food
            </p>

          </div>

        </div>

      </section>





      {/* 
          THE KITCHEN
       */}

      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-6 lg:px-8 lg:py-28">

        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">

          {/* Content */}

          <div className="order-2 lg:order-1">

            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8c1712]">
              The Kitchen
            </p>

            <h2 className="mt-5 text-4xl font-bold leading-tight text-[#3f0806] sm:text-5xl">
              Crafted by experience.
              <br />
              Served with care.
            </h2>

            <p className="mt-7 text-justify text-base leading-8 text-gray-600">
              Behind every plate is a team that understands the importance of
              patience, precision and consistency.
            </p>

            <p className="mt-5 text-justify text-base leading-8 text-gray-600">
              Our chefs bring years of experience and a genuine passion for
              the cuisines they prepare. From the selection of ingredients to
              the final touch, every step is handled with care.
            </p>

            <div className="mt-10 space-y-7">

              {VALUES.slice(0, 2).map((value) => {

                const Icon = value.icon;

                return (
                  <div
                    key={value.title}
                    className="flex gap-5"
                  >

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#d9c7aa] bg-white">
                      <Icon className="h-5 w-5 text-[#8c1712]" />
                    </div>

                    <div>

                      <h3 className="font-semibold text-[#3f0806]">
                        {value.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {value.description}
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>

          </div>


          {/* Image */}

          <div className="relative order-1 lg:order-2">

            <div className="aspect-[4/5] overflow-hidden bg-[#e8dfd4]">

              <img
                src={IMAGES.chef}
                alt="Chef preparing food at Al Arafa Cuisine"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              />

            </div>


          </div>

        </div>

      </section>


      {/* 
          INGREDIENTS / FULL WIDTH IMAGE
       */}

      <section className="relative min-h-[520px] overflow-hidden">

        <img
          src={IMAGES.ingredients}
          alt="Fresh ingredients used at Al Arafa Cuisine"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-[#3b0705]/75" />

        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-[1400px] items-center px-5 py-20 sm:px-6 lg:px-8">

          <div className="max-w-2xl text-white">

            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f4d27a]">
              Quality Begins Here
            </p>

            <h2 className="mt-5 text-4xl text-[#ffffff] font-bold leading-tight sm:text-5xl">
              Good food starts
              <br />
              with good ingredients.
            </h2>

            <p className="mt-7 max-w-xl text-justify text-base leading-8 text-white/75">
              We carefully select our ingredients to ensure that every dish
              carries the freshness, aroma and depth of flavour we expect from
              our kitchen.
            </p>

            <div className="mt-8 flex items-center gap-3">

              

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4d27a]">
                Fresh · Authentic · Delicious
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* 
          DINING EXPERIENCE
       */}

      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-6 lg:px-8 lg:py-28">

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">

          <div className="relative">

            <div className="aspect-[5/4] overflow-hidden">

              <img
                src={IMAGES.experience}
                alt="Dining experience at Al Arafa Cuisine"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              />

            </div>

          </div>


          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8c1712]">
              The Experience
            </p>

            <h2 className="mt-5 text-4xl font-bold leading-tight text-[#3f0806] sm:text-5xl">
              Come hungry.
              <br />
              Leave with memories.
            </h2>

            <p className="mt-7 text-justify text-lg leading-9 text-gray-700">
              {RESTAURANT.experience}
            </p>

            <p className="mt-5 text-justify text-base leading-8 text-gray-600">
              Because dining is not simply about the food. It is about
              gathering around the table, sharing stories, discovering new
              flavours and enjoying time together.
            </p>

            <div className="mt-9">

              <a
                href="/contact"
                className="group inline-flex items-center gap-3 border-b border-[#8c1712] pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#8c1712]"
              >
                Plan Your Visit

                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>

            </div>

          </div>

        </div>

      </section>


      {/* 
          PHILOSOPHY
       */}

      <section className="bg-[#f0e9df] px-5 py-20 sm:py-24 lg:py-28">

        <div className="mx-auto max-w-[900px] text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8c1712]">
            Our Philosophy
          </p>

          <div className="mx-auto mt-7 h-px w-16 bg-[#c49a43]" />

          <blockquote className="mt-8 text-3xl font-medium leading-[1.35] tracking-tight text-[#3f0806] sm:text-4xl lg:text-5xl">
            “Great food brings people together, creates memories and turns
            ordinary moments into something worth remembering.”
          </blockquote>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
            The Al Arafa Way
          </p>

        </div>

      </section>


      {/* 
          VISIT US
       */}

      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-6 lg:px-8 lg:py-28">

        <div className="grid overflow-hidden bg-white lg:grid-cols-2">

          <div className="relative min-h-[400px] bg-[#ddd7ce]">

            <img
              src={ABOUT_HERO}
              alt="Al Arafa Cuisine"
              className="absolute inset-0 h-full w-full object-cover"
            />

          </div>


          <div className="flex items-center px-7 py-14 sm:px-10 lg:px-16">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8c1712]">
                Visit Us
              </p>

              <h2 className="mt-5 text-4xl font-bold text-[#3f0806] sm:text-5xl">
                Your table is waiting.
              </h2>

              <p className="mt-6 max-w-lg text-justify text-base leading-8 text-gray-600">
                Come together with family and friends and experience the
                flavours of Arabian, North Indian and South Indian cuisine.
              </p>

              <div className="mt-8 flex gap-4">

                <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#8c1712]" />

                <p className="font-medium leading-7 text-gray-900">
                  {RESTAURANT.name}
                  <br />
                  {RESTAURANT.address}
                </p>

              </div>

              <a
                href="/contact"
className="group mt-9 inline-flex items-center gap-3 bg-[#4d0907] px-7 py-4 text-sm font-semibold uppercase tracking-[0.15em] !text-white transition hover:bg-[#650b08] hover:!text-white"              >
                Contact & Reservations

                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>

            </div>

          </div>

        </div>

      </section>


      {/* 
          FINAL CTA
       */}

      <section className="bg-[#3b0705] px-5 py-20 text-center text-white sm:py-24">

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f4d27a]">
          Al-Arafa Cuisine
        </p>

        <h2 className="mt-5 text-[#ffffff] text-4xl font-bold sm:text-5xl lg:text-6xl">
          Come share the table.
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-white/65">
          Discover flavours, gather your loved ones and create moments worth
          remembering.
        </p>

        <a
          href="/contact"
          className="mt-9 inline-flex items-center gap-3 border border-[#e9bd5b] px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#f4d27a] transition hover:bg-[#e9bd5b] hover:text-[#3b0705]"
        >
          Reserve Your Table

          <ArrowUpRight className="h-4 w-4" />
        </a>

      </section>

    </main>
  );
}
