/**
 * Al-Arafa Restaurant - Order Status Component
 */

"use client";

import { FC } from "react";
import type { OrderStatus as OrderStatusType } from "@/types";
import clsx from "clsx";

interface OrderStatusProps {
  status: OrderStatusType;
  vertical?: boolean;
  fulfillmentType?: "delivery" | "pickup";
}

const statusConfig = {
  pending: {
    label: "Order Placed",
    color: "text-status-pending",
    bg: "bg-status-pending",
    icon: "📝",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-status-confirmed",
    bg: "bg-status-confirmed",
    icon: "✅",
  },
  preparing: {
    label: "Preparing",
    color: "text-status-preparing",
    bg: "bg-status-preparing",
    icon: "👨‍🍳",
  },
  ready: {
    label: "Ready",
    color: "text-status-ready",
    bg: "bg-status-ready",
    icon: "🎯",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "text-status-out-for-delivery",
    bg: "bg-status-out-for-delivery",
    icon: "🚗",
  },
  delivered: {
    label: "Delivered",
    color: "text-status-delivered",
    bg: "bg-status-delivered",
    icon: "✨",
  },
  picked_up: {
    label: "Picked Up",
    color: "text-status-delivered",
    bg: "bg-status-delivered",
    icon: "✨",
  },
  completed: {
    label: "Completed",
    color: "text-status-delivered",
    bg: "bg-status-delivered",
    icon: "✅",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-status-cancelled",
    bg: "bg-status-cancelled",
    icon: "❌",
  },
};

export const OrderStatus: FC<OrderStatusProps> = ({
  status,
  vertical = false,
  fulfillmentType = "delivery",
}) => {
  const config = statusConfig[status];

  if (vertical) {
    const deliveryStatuses: OrderStatusType[] = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "out_for_delivery",
      "delivered",
    ];

    const pickupStatuses: OrderStatusType[] = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "picked_up",
    ];

    const statuses =
      fulfillmentType === "pickup" ? pickupStatuses : deliveryStatuses;

    let currentIndex = statuses.indexOf(status);

    if (status === "completed") {
      currentIndex = statuses.length - 1;
    }

    /*
     * CANCELLED
     */
    if (status === "cancelled") {
      return (
        <div className="w-full">
          <div className="relative space-y-2.5 sm:space-y-3">
            {statuses.map((s, index) => {
              const sConfig = statusConfig[s];

              return (
                <div
                  key={s}
                  className="relative flex min-w-0  items-center gap-3 py-2.5 sm:gap-4 sm:py-3"
                >
                  {/* Connecting Line */}
                  {index < statuses.length - 1 && (
                    <div className="absolute left-[17px] top-[42px] h-[calc(100%-18px)] w-px bg-border-light sm:left-[19px]" />
                  )}

                  {/* Empty Circle */}
                  <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-light bg-white sm:h-10 sm:w-10">
                    <span className="text-xs text-text-light">○</span>
                  </div>

                  {/* Label */}
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium leading-5 text-text-tertiary sm:text-sm">
                      {sConfig.label}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Cancelled */}
            <div className="relative flex min-w-0 items-center gap-3 py-2.5 sm:gap-4 sm:py-3">
              <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-cancelled text-sm shadow-sm ring-4 ring-status-cancelled/10 sm:h-10 sm:w-10 sm:text-base">
                {statusConfig.cancelled.icon}
              </div>

              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold leading-5 text-status-cancelled sm:text-base">
                  {statusConfig.cancelled.label}
                </span>

                <span className="mt-0.5 block text-[11px] leading-4 text-text-tertiary sm:text-xs">
                  Order cancelled
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    /*
     * NORMAL STATUS TIMELINE
     */
    return (
      <div className="w-full">
        <div className="relative space-y-2.5 sm:space-y-3">
          {statuses.map((s, index) => {
            const sConfig = statusConfig[s];

            const isCompleted = index <= currentIndex;

            const isCurrent =
              s === status ||
              (status === "completed" && index === statuses.length - 1);

            const isLast = index === statuses.length - 1;

            return (
<div
  key={s}
  className="relative flex min-w-0 items-center gap-3 sm:gap-4"
>
                {/* Connecting Line */}
                {!isLast && (
                  <div
                    className={clsx(
                      "absolute left-[17px] top-[38px] h-[calc(100%-8px)] w-px sm:left-[19px]",
                      index < currentIndex
                        ? "bg-primary/40"
                        : "bg-border-light",
                    )}
                  />
                )}

                {/* Icon */}
                <div
                  className={clsx(
                    "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm transition-all sm:h-10 sm:w-10 sm:text-base",
                    isCurrent
                      ? `${sConfig.bg} shadow-sm ring-4 ring-primary/10`
                      : isCompleted
                        ? `${sConfig.bg}`
                        : "border border-border-light bg-white",
                  )}
                >
                  {isCompleted ? (
                    <span className="leading-none">{sConfig.icon}</span>
                  ) : (
                    <span className="text-xs text-text-light">○</span>
                  )}
                </div>

                {/* Content */}
                <div
                  className={clsx(
                    "min-w-0 flex-1 rounded-lg px-2 py-2 transition-all sm:px-3",
                    isCurrent ? "bg-primary/[0.05]" : "bg-transparent",
                  )}
                >
                  <div
                    className={clsx(
                      "truncate text-[13px] leading-5 sm:text-sm",
                      isCurrent
                        ? "font-bold text-text-primary"
                        : isCompleted
                          ? `font-medium ${sConfig.color}`
                          : "font-medium text-text-tertiary",
                    )}
                  >
                    {sConfig.label}
                  </div>

                  {isCurrent && (
                    <div className="mt-0.5 text-[11px] leading-4 text-text-tertiary sm:text-xs">
                      Current status
                    </div>
                  )}
                </div>

                {/* Current Dot */}
                {isCurrent && (
                  <span className="relative z-10 mr-1 h-2 w-2 shrink-0 rounded-full bg-primary sm:mr-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /*
   * COMPACT STATUS
   *
   * No large badge/pill.
   */
  return (
    <div
      className={clsx(
        "inline-flex max-w-full items-center gap-2 text-sm font-semibold",
        config.color,
      )}
    >
      <span className="shrink-0 text-base leading-none">{config.icon}</span>

      <span className="truncate">{config.label}</span>
    </div>
  );
};
