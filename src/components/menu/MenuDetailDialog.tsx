/**
 * Al-Arafa Restaurant - Menu Detail Dialog Component
 * Responsive food detail modal
 */

"use client";

import { FC } from "react";
import type { MenuItem } from "@/types";
import { Flame, Star, Users } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface MenuDetailDialogProps {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MenuDetailDialog: FC<MenuDetailDialogProps> = ({
  item,
  open,
  onOpenChange,
}) => {
  if (!item || !open) return null;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      requestAnimationFrame(() => {
        onOpenChange(false);
      });
    } else {
      onOpenChange(true);
    }
  };

  const cleanedDescription = (() => {
    if (!item.description) return "";

    return item.description
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/?p[^>]*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;|&#160;|&#xa0;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  })();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal>
      <DialogContent
        className="
          w-[calc(100%-20px)]
          max-w-md
          overflow-hidden
          rounded-[24px]
          border-0
          bg-[#fffaf2]
          p-0
          shadow-[0_24px_80px_rgba(40,20,10,0.25)]

          sm:w-[calc(100%-32px)]
          sm:max-w-3xl
          sm:rounded-2xl
        "
      >
        {/* 
            MAIN LAYOUT
         */}
        <div
          className="
            max-h-[88vh]
            overflow-y-auto
            overscroll-contain

            sm:max-h-[90vh]
            sm:overflow-hidden
          "
        >
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* 
                IMAGE
             */}
            <div
              className="
                relative
                h-[220px]
                overflow-hidden
                bg-[#eadfd2]

                sm:h-[520px]
              "
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="
                    h-full
                    w-full
                    object-cover
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
                    from-[#f3e7d7]
                    to-[#e5d1ba]
                  "
                >
                  <img
                    src="/images/food-icon.svg"
                    alt="Food"
                    className="h-20 w-20 opacity-60"
                  />
                </div>
              )}

              {/* Image bottom gradient */}
              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  h-28
                  bg-gradient-to-t
                  from-black/45
                  to-transparent
                  sm:h-36
                "
              />

              {/* MOBILE NAME OVER IMAGE */}
              <div
                className="
                  absolute
                  bottom-4
                  left-4
                  right-4
                  sm:hidden
                "
              >
                <DialogTitle
                  className="
                    max-w-[85%]
                    text-xl
                    font-extrabold
                    leading-tight
                    tracking-tight
                    text-white
                    drop-shadow-[0_2px_5px_rgba(0,0,0,0.35)]
                  "
                >
                  {item.name}
                </DialogTitle>
              </div>

              {/* BADGES */}
              <div
                className="
                  absolute
                  left-3
                  top-3
                  flex
                  flex-wrap
                  gap-1.5
                  sm:left-4
                  sm:top-4
                "
              >
                {item.popular && (
                  <span
                    className="
                      flex
                      items-center
                      gap-1
                      rounded-full
                      bg-[#92251C]
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      text-white
                      shadow-lg
                    "
                  >
                    <Star className="h-3 w-3 fill-current" strokeWidth={2} />
                    Popular
                  </span>
                )}

                {!item.available && (
                  <span
                    className="
                      rounded-full
                      bg-white/95
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      text-[#92251C]
                      shadow-lg
                    "
                  >
                    Unavailable
                  </span>
                )}
              </div>

              {/* VEGETARIAN BADGE
              <div
                className="
                  absolute
                  bottom-4
                  right-4
                  rounded-full
                  bg-white/95
                  px-2.5
                  py-1
                  text-[9px]
                  font-bold
                  shadow-lg
                  sm:bottom-5
                  sm:right-5
                "
              >
                <span
                  className={
                    item.isVegetarian ? "text-green-700" : "text-red-700"
                  }
                >
                  {item.isVegetarian ? "VEGETARIAN" : "NON-VEG"}
                </span>
              </div> */}
            </div>

            {/* 
                CONTENT
             */}
            <div
              className="
                flex
                flex-col
                bg-[#fffaf2]
                p-5

                sm:p-7
              "
            >
              {/* DESKTOP TITLE */}
              <div className="hidden sm:block">
                <DialogTitle
                  className="
                    text-2xl
                    font-extrabold
                    leading-tight
                    tracking-tight
                    text-[#211a16]
                  "
                >
                  {item.name}
                </DialogTitle>

                {item.categoryName && (
                  <p className="mt-1 text-sm text-[#8a7b70]">
                    {item.categoryName}
                  </p>
                )}
              </div>

              {/* MOBILE CATEGORY */}
              {item.categoryName && (
                <p
                  className="
                    mb-3
                    text-xs
                    font-medium
                    text-[#8a7b70]
                    sm:hidden
                  "
                >
                  {item.categoryName}
                </p>
              )}

              {/* INFO BADGES */}
              <div className="mb-4 flex flex-wrap gap-1.5">
                <span
                  className={`
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    px-2.5
                    py-1
                    text-[10px]
                    font-semibold

                    ${
                      item.isVegetarian
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }
                  `}
                >
                  <span
                    className={`
                      h-1.5
                      w-1.5
                      rounded-full
                      ${item.isVegetarian ? "bg-green-600" : "bg-red-600"}
                    `}
                  />

                  {item.isVegetarian ? "Vegetarian" : "Non-Veg"}
                </span>

                {item.spiceLevel > 0 && (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-0.5
                      rounded-full
                      border
                      border-orange-200
                      bg-orange-50
                      px-2.5
                      py-1
                      text-[10px]
                      font-semibold
                      text-orange-700
                    "
                  >
                    {[...Array(item.spiceLevel)].map((_, i) => (
                      <Flame key={i} className="h-3 w-3 fill-orange-500" />
                    ))}
                  </span>
                )}
              </div>

              {/* DESCRIPTION */}
              {cleanedDescription && (
                <section className="mb-4">
                  <h4
                    className="
                      mb-1.5
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-[0.08em]
                      text-[#92251C]
                    "
                  >
                    About this dish
                  </h4>

                  <p
                    className="
                      text-[13px]
                      leading-[1.65]
                      text-[#625850]

                      sm:text-sm
                      sm:leading-relaxed
                    "
                  >
                    {cleanedDescription}
                  </p>
                </section>
              )}

              {/* SERVES */}
              {item.servesPeople && (
                <div
                  className="
                    mb-5
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-[#eadfd2]
                    bg-white/70
                    px-3.5
                    py-3
                  "
                >
                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-[#f5e8d9]
                      text-[#92251C]
                    "
                  >
                    <Users className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-[#8a7b70]">
                      Serves
                    </p>

                    <p className="text-sm font-bold text-[#211a16]">
                      {item.servesPeople} people
                    </p>
                  </div>
                </div>
              )}

              {/* PRICE */}
              <div
                className="
                  mt-auto
                  flex
                  items-end
                  justify-between
                  gap-4
                  border-t
                  border-[#eadfd2]
                  pt-4
                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.08em]
                      text-[#8a7b70]
                    "
                  >
                    Price
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-2xl
                      font-extrabold
                      tracking-tight
                      text-[#92251C]

                      sm:text-3xl
                    "
                  >
                    S$ {item.price.toFixed(2)}
                  </p>
                </div>

                {!item.available && (
                  <span
                    className="
                      rounded-full
                      bg-red-50
                      px-3
                      py-1.5
                      text-[10px]
                      font-bold
                      text-red-700
                    "
                  >
                    Currently unavailable
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
