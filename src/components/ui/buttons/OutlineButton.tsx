"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const OutlineButton = ({
  children,
  className = "",
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={`
        group relative inline-flex h-[42px] min-w-[130px]
        items-center justify-center overflow-hidden
        rounded-[6px] border-2 border-[#dd040c]
        bg-transparent px-6
        font-medium text-[#dd040c]
        transition-colors duration-500
        hover:text-white
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {/* Animated background */}
      <span
        className="
          absolute -bottom-20 -right-20
          h-[150px] w-[200px]
          rounded-full bg-[#dd040c]
          transition-all duration-700
          group-hover:-bottom-[30px]
          group-hover:-right-[30px]
        "
      />

      {/* Button content */}
      <span className="relative z-10">
        {children}
      </span>
    </button>
  );
};

export default OutlineButton;



// ### Usage

// ```jsx
// <OutlineButton Button onClick={() => console.log("Order clicked")}>
//   Order Now
// </OutlineButton>
// ```

// ```jsx
// <OutlineButton onClick={handleCheckout}>
//   Checkout
// </OutlineButton>
// ```

// For a form:

// ```jsx
// <OutlineButton type="submit">
//   Place Order
// </OutlineButton>
// ```

// You can also disable it:

// ```jsx
// <OutlineButton disabled={isLoading}>
//   {isLoading ? "Processing..." : "Place Order"}
// </OutlineButton>
// ```
    