
"use client";

import React from "react";

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const PrimaryButton = ({
  children,
  className = "",
  ...props
}: PrimaryButtonProps) => {
  return (
    <button
      {...props}
      className={`
        group relative inline-flex h-[46px] min-w-[140px]
        items-center justify-center
        overflow-hidden rounded-[7px]
        bg-[#dd040c] px-7
        font-semibold text-white
        shadow-[0_4px_12px_rgba(221,4,12,0.20)]
        transition-all duration-200

        hover:bg-[#c9030b]
        hover:shadow-[0_6px_18px_rgba(221,4,12,0.28)]

        active:scale-[0.96]
        active:bg-[#b8030a]
        active:shadow-[0_2px_6px_rgba(221,4,12,0.18)]

        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#dd040c]
        focus-visible:ring-offset-2

        disabled:cursor-not-allowed
        disabled:opacity-50
        disabled:shadow-none

        ${className}
      `}
    >
      {/* Click ripple / highlight */}
      <span
        className="
          absolute inset-0
          scale-0 rounded-full
          bg-white/15
          transition-transform duration-300
          group-active:scale-[2.5]
        "
      />

      {/* Subtle top highlight */}
      <span
        className="
          absolute inset-x-0 top-0 h-px
          bg-white/25
        "
      />

      <span className="relative z-10">
        {children}
      </span>
    </button>
  );
};

export default PrimaryButton;
