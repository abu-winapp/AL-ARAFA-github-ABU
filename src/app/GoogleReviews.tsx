"use client";

import Image from "next/image";
import { useState } from "react";
import { MoreVertical, Star } from "lucide-react";

type Review = {
  id: number;
  name: string;
  type: string;
  reviewCount: number;
  photoCount: number;
  profileImage: string;
  rating: number;
  date: string;
  review: string;
  images: string[];
  googleUrl?: string;
};

const reviews: Review[] = [
  {
    id: 1,
    name: "Suhail Ali",
    type: "Local Guide",
    reviewCount: 200,
    photoCount: 1743,
    profileImage: "/images/reviews/suhailali.png",
    rating: 4,
    date: "Edited 4 years ago",
    review: `
I had tried this restaurant when they had just opened, maybe a few days old only. At that time their food was pathetic and service was equally bad. One you have a bad experience with a restautant you don't try it for a long time. Same happened with me.

After a gap of 2 years and out of paucity of time I took a risk and tried this restaurant again. I must say I was completely bowled over.

I tried their Mandi chicken and Falafel Shawarma. Mandi chicken was an absolute delight. V tender and juicy. Good quality basmati rice used and side chutney amd salad was also good. Despite having a mild hunger I finished the whole dish amd mind it their portion is really large.

Falafel shwarma was equally good and quite large too.

To add icing on the cake, Mandi chicken costed SGD 7.5 and Falafel Wrap was SGD 8 only. Its literally a steal at these prices. They are exactly opposite gate 6 of Mustafa so location is super convenient.

Overall value for money and superb taste. A must visit if you are visiting little India
`,

    images: [
      "/images/reviews/suhailali-foodimg-1.webp",
      "/images/reviews/suhailali-foodimg-2.webp",
      "/images/reviews/suhailali-foodimg-3.webp",
      "/images/reviews/suhailali-foodimg-4.webp",
      "/images/reviews/suhailali-foodimg-5.webp",
    ],
    googleUrl: "https://share.google/7nRp5jGVCDUNlAjE6",
  },

  {
    id: 2,
    name: "Amytan",
    type: "Local Guide",
    reviewCount: 85,
    photoCount: 320,
    profileImage: "/images/reviews/amytan.png",
    rating: 5,
    date: "2 years ago",
    review: `Every time I visit, they make me want to come back for more! The food is consistently so delicious.

Chicken briyani is rich and flavorful. The rice tasted like it's been cooked with many exotic spices.
Butter chicken was the best I've ever tasted. The pieces of chicken hidden under the creamy orange gravy were grilled and yet so so tender. We ate it with our favourite garlic naan. Their naan has always been done to perfection with a crispy exterior and inside fluffy. I've never tasted any naan better.

I will come back again to try all the other food on the menu! Thanks for providing great services!`,

    images: [
      "/images/reviews/amytan-foodimg-1.webp",
      "/images/reviews/amytan-foodimg-2.webp",
      "/images/reviews/amytan-foodimg-3.webp",
      "/images/reviews/amytan-foodimg-4.webp",
    ],
    googleUrl: "https://share.google/xsOSPFSWFXjS8MG7i",
  },

  {
    id: 3,
    name: "MF BM",
    type: "Local Guide",
    reviewCount: 120,
    photoCount: 450,
    profileImage: "/images/reviews/mf bm.png",
    rating: 5,
    date: "1 year ago",
    review: `Weekends are jammed pack with people. Good is good, so that's understandable. Despite the many staff, only 1 or 2 seems to take orders, and everything is verbally taken without any writing on any notebook.

Makes you wonder if your order went through or not? And preparation time could do better. A simple masala chai latte can take 25 minutes to prepare. Ready food like Mandi lamb also takes a pretty good 15 mins to serve.

Other than the service bloopers, food is good as mentioned earlier. If you have a lot of time and patience to wait, this a good place to eat and chill at. 5 stars.`,
    images: [
      "/images/reviews/mf bm-foodimg-1.webp",
      "/images/reviews/mf bm-foodimg-2.webp",
      "/images/reviews/mf bm-foodimg-3.webp",
      "/images/reviews/mf bm-foodimg-4.webp",
    ],
    googleUrl: "https://share.google/6Nuwza7xeJHI0fVik",
  },

  {
    id: 4,
    name: "Muhamed Farhan",
    type: "Local Guide",
    reviewCount: 64,
    photoCount: 180,
    profileImage: "/images/reviews/muhamed farhan.png",
    rating: 5,
    date: "8 months ago",
    review: `The staff are exceptional very well behaved and knowledgeable about food etc.. but the food I tasted was called shawarma chicken rice it was very disappointing as it was very dry food.`,
    images: [
      "/images/reviews/muhamed farhan-foodimg-1.webp",
      "/images/reviews/muhamed farhan-foodimg-2.webp",
      "/images/reviews/muhamed farhan-foodimg-3.webp",
    ],
    googleUrl: "https://share.google/iCgCy1fm7e8ScXyEB",
  },

  {
    id: 5,
    name: "Mustafa Zainudin",
    type: "Local Guide",
    reviewCount: 95,
    photoCount: 275,
    profileImage: "/images/reviews/mustafazainudin.png",
    rating: 5,
    date: "6 months ago",
    review: `2nd visit on 8th Jan 2022:
Plan to have a late lunch at City Square but end up at Al Arafa. We ordered Mandi rice mixer grill, Arayes Kofta, Mohalabia & Kunafe.
Taste is still good as on 2018!

1st visit in 2018: 1st time tried this place after seeing review in facebook. Tried the Lamb Mandi rice , Mandi rice platter for 2pax. Rice is soft and authentic taste of Arab rice. Tried the homemade dessert called Mahalabia (Milk pudding) it taste so good! Definitely will come with more makan kaki to explore the other dishes.`,
    images: [
      "/images/reviews/mustafazainudin-foodimg-1.webp",
      "/images/reviews/mustafazainudin-foodimg-2.webp",
      "/images/reviews/mustafazainudin-foodimg-3.webp",
      "/images/reviews/mustafazainudin-foodimg-4.webp",
      "/images/reviews/mustafazainudin-foodimg-5.webp",
    ],
    googleUrl: "https://share.google/iCgCy1fm7e8ScXyEB",
  },

  {
    id: 6,
    name: "Slain",
    type: "Local Guide",
    reviewCount: 72,
    photoCount: 210,
    profileImage: "/images/reviews/slain.png",
    rating: 5,
    date: "3 months ago",
    review: `A family feast of mandi rice with chicken, lamb shank and lamb ribs. One of the best mandi that anyone should try with their family.

Mine was a takeaway. However, my siblings felt dine is way better.

Definitely for big eaters and meat lovers 😊`,
    images: ["/images/reviews/slain-foodimg-1.webp"],
    googleUrl: "https://share.google/Igqjzr8p0FjtwZtcG",
  },
];

export default function GoogleReviews() {
  return (
    <>  
    <section className="w-full bg-transparent px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16 xl:px-10">
      <div className="mx-auto w-full max-w-[1800px]">
        {/* Section Heading */}
        <div className="mb-8 text-center sm:mb-10 lg:mb-12">
          <h2 className="text-2xl font-bold text-[#221a16] sm:text-3xl lg:text-4xl">
            What Our Customers Say
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Read what our customers have to say about their experience
          </p>
        </div>

        {/* Reviews */}
        <div
          className="
    grid
    grid-cols-1
    gap-5
    sm:gap-6
    md:grid-cols-2
    md:gap-6
    lg:grid-cols-3
    lg:gap-7
    xl:gap-8
  "
        >
          {reviews.slice(0, 6).map((review, index) => (
            <div
              key={review.id}
              className={index >= 4 ? "hidden md:block" : ""}
            >
              <ReviewCard review={review} />
            </div>
          ))}


        </div>
        
      </div>

    </section>
    <section>
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
    </section>
    </>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);

  const isLongReview = review.review.length > 180;

  const handleOpenGoogle = () => {
    if (!review.googleUrl) return;

    window.open(review.googleUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      className="
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-xl
        border
        border-[#e7dcc9]
        bg-white
        shadow-[0_2px_8px_rgba(0,0,0,0.06)]
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)]
        sm:rounded-2xl
      "
    >
      <div className="flex h-full flex-col p-4 sm:p-5 lg:p-6">
        {/* PROFILE HEADER */}

        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
            {/* Profile Image */}
            <div className="relative h-10 w-10 shrink-0 overflow-visible sm:h-14 sm:w-14">
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image
                  src={review.profileImage}
                  alt={review.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>

              {/* Small Google-style badge */}
              <div
                className="
                  absolute
                  -bottom-0.5
                  -right-1
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-white
                  bg-[#fbbc04]
                  sm:h-7
                  sm:w-7
                "
              >
                <span className="text-[10px] font-bold text-white sm:text-sm">
                  ★
                </span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="min-w-0">
              <h3
                className="
                  truncate
                  text-sm
                  font-semibold
                  leading-tight
                  text-[#221a16]
                  sm:text-lg
                  lg:text-xl
                "
              >
                {review.name}
              </h3>

              <p
                className="
                  mt-0.5
                  truncate
                  text-[9px]
                  leading-tight
                  text-[#6b6058]
                  sm:mt-1
                  sm:text-xs
                  lg:text-sm
                "
              >
                {review.type}
                <span className="mx-1">·</span>
                {review.reviewCount} reviews
                <span className="mx-1">·</span>
                {review.photoCount.toLocaleString()} photos
              </p>
            </div>
          </div>

          {/* Three Dots */}
          <button
            type="button"
            aria-label="More options"
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-full
              text-[#6b6058]
              transition
              hover:bg-gray-100
              sm:h-9
              sm:w-9
            "
          >
            <MoreVertical
              size={18}
              strokeWidth={2.3}
              className="sm:h-5 sm:w-5"
            />
          </button>
        </div>

        {/* RATING */}

        <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:mt-5 sm:gap-2.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={15}
                strokeWidth={0}
                fill={index < review.rating ? "#fbbc04" : "#e7dcc9"}
                className="sm:h-[20px] sm:w-[20px] lg:h-[22px] lg:w-[22px]"
              />
            ))}
          </div>

          <span
            className="
              text-[9px]
              text-[#6b6058]
              sm:text-xs
              lg:text-sm
            "
          >
            {review.date}
          </span>
        </div>

        {/* REVIEW TEXT */}
        <div className="mt-3 sm:mt-4">
          <p
            className={`
      text-[11px]
      leading-[1.55]
      text-[#221a16]
      sm:text-sm
      sm:leading-[1.65]
      lg:text-base
      ${!expanded ? "line-clamp-4" : ""}
    `}
          >
            {review.review}
          </p>

          {isLongReview && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="
        mt-1
        text-[11px]
        font-medium
        text-[#1557d6]
        hover:underline
        sm:text-sm
      "
            >
              {expanded ? "Less" : "More"}
            </button>
          )}
        </div>

        {/* REVIEW PHOTOS */}
        <div className="mt-4 sm:mt-5">
          <div
            className="
      grid
      grid-cols-2
      gap-1.5
      sm:gap-2
      lg:grid-cols-5
    "
          >
            {review.images.slice(0, expanded ? 5 : 2).map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={handleOpenGoogle}
                className="
            group
            relative
            aspect-square
            overflow-hidden
            rounded-lg
            bg-gray-100
          "
              >
                <Image
                  src={image}
                  alt={`${review.name} review photo ${index + 1}`}
                  fill
                  sizes="
              (max-width: 639px) 45vw,
              (max-width: 1023px) 30vw,
              18vw
            "
                  className="
              object-cover
              transition-transform
              duration-300
              group-hover:scale-105
            "
                />
              </button>
            ))}
          </div>
        </div>

        {/* GOOGLE REVIEW BUTTON */}

        {review.googleUrl && (
          <div className="mt-auto pt-4 sm:pt-5">
            <button
              type="button"
              onClick={handleOpenGoogle}
              className="
                text-[10px]
                font-medium
                text-[#1557d6]
                transition
                hover:underline
                sm:text-xs
              "
            >
              View on Google
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
