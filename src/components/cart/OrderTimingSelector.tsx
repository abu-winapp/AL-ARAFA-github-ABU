"use client";

import { useEffect, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useCartStore } from "@/lib/store/useCartStore";
import { Card } from "@/components/ui/card";
import OrderTimeDialog from "@/components/ui/OrderTimeDialog";
import { Clock3, ChevronRight, Check } from "lucide-react";

interface OrderTimingSelectorProps {
  isRestaurantOpen: boolean;
}

export function OrderTimingSelector({
  isRestaurantOpen,
}: OrderTimingSelectorProps) {
  const {
    orderTiming,
    getAdvanceOrderSchedule,
    setAdvanceOrderSchedule,
    clearAdvanceOrderSchedule,
  } = useCartStore();

  const [showOrderTimeDialog, setShowOrderTimeDialog] = useState(false);

  const [orderTimeType, setOrderTimeType] = useState<"now" | "advance">(
    orderTiming === "scheduled" ? "advance" : "now",
  );

  const [selectedOrderDate, setSelectedOrderDate] = useState<Dayjs | null>(
    dayjs(),
  );

  const [selectedOrderSlot, setSelectedOrderSlot] = useState("");

  const [selectedOrderDeliveryTime, setSelectedOrderDeliveryTime] =
    useState("");

  const advanceSchedule = getAdvanceOrderSchedule();

  /*
   * Convert stored 24-hour time:
   *
   * 14:30 -> 2:30 PM
   * 09:15 -> 9:15 AM
   */
  const formatStoredTimeForDialog = (time: string) => {
    const [hourString, minuteString] = time.split(":");

    const hour24 = Number(hourString);
    const minute = Number(minuteString);

    if (Number.isNaN(hour24) || Number.isNaN(minute)) {
      return "";
    }

    const period = hour24 >= 12 ? "PM" : "AM";

    const hour12 = hour24 % 12 || 12;

    return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
  };

  /*
   * Compact label shown in the UI.
   */
  const scheduleLabel =
    advanceSchedule?.scheduledDate && advanceSchedule?.scheduledTime
      ? `${dayjs(advanceSchedule.scheduledDate).format("DD MMM")} • ${formatStoredTimeForDialog(
          advanceSchedule.scheduledTime,
        )}`
      : "Pick date & time";

  /*
   * Keep local state synchronized with an existing scheduled order.
   *
   * This is especially useful when the component is mounted again
   * after navigating between cart / checkout.
   */
  useEffect(() => {
    if (
      advanceSchedule?.scheduledDate &&
      advanceSchedule?.scheduledTime
    ) {
      setSelectedOrderDate(dayjs(advanceSchedule.scheduledDate));

      setSelectedOrderDeliveryTime(
        formatStoredTimeForDialog(advanceSchedule.scheduledTime),
      );

      setOrderTimeType("advance");
    } else {
      setOrderTimeType("now");
    }
  }, [
    advanceSchedule?.scheduledDate,
    advanceSchedule?.scheduledTime,
  ]);

  /*
   * ORDER NOW
   */
  const handleOrderNowClick = () => {
    setOrderTimeType("now");
    clearAdvanceOrderSchedule();
  };

  /*
   * ORDER IN ADVANCE
   */
  const handleScheduleClick = () => {
    setOrderTimeType("advance");

    /*
     * If a schedule already exists, load it into the dialog.
     */
    if (
      advanceSchedule?.scheduledDate &&
      advanceSchedule?.scheduledTime
    ) {
      setSelectedOrderDate(dayjs(advanceSchedule.scheduledDate));

      setSelectedOrderDeliveryTime(
        formatStoredTimeForDialog(advanceSchedule.scheduledTime),
      );
    } else {
      setSelectedOrderDate(dayjs());
      setSelectedOrderDeliveryTime("");
      setSelectedOrderSlot("");
    }

    setShowOrderTimeDialog(true);
  };

  /*
   * CONFIRM DIALOG
   */
  const handleDialogConfirm = () => {
    if (
      orderTimeType === "advance" &&
      selectedOrderDate &&
      selectedOrderDeliveryTime
    ) {
      /*
       * Example:
       * "2:30 PM"
       *
       * split(":") gives:
       * ["2", "30 PM"]
       */
      const [rawHourString, rawMinutePart] =
        selectedOrderDeliveryTime.split(":");

      const rawHour = parseInt(rawHourString, 10);

      const minute = parseInt(
        rawMinutePart?.replace(/[^0-9]/g, "") || "0",
        10,
      );

      const isPM =
        selectedOrderDeliveryTime.toUpperCase().includes("PM");

      const isAM =
        selectedOrderDeliveryTime.toUpperCase().includes("AM");

      let hour = rawHour;

      if (isPM && rawHour !== 12) {
        hour += 12;
      } else if (isAM && rawHour === 12) {
        hour = 0;
      }

      const scheduledDate =
        selectedOrderDate.format("YYYY-MM-DD");

      const scheduledTime = `${String(hour).padStart(
        2,
        "0",
      )}:${String(minute).padStart(2, "0")}`;

      setAdvanceOrderSchedule(
        scheduledDate,
        scheduledTime,
      );

      setShowOrderTimeDialog(false);

      return;
    }

    if (orderTimeType === "now") {
      clearAdvanceOrderSchedule();
      setShowOrderTimeDialog(false);
    }
  };

  return (
    <div className="w-full">
      {/* 
          HEADER
       */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold leading-tight text-[#241F1B] sm:text-lg">
            When do you want your order?
          </h3>


        </div>

        {orderTiming === "scheduled" && (
          <span className="hidden rounded-full bg-[#EAF8EF] px-2.5 py-1 text-[10px] font-semibold text-[#287A52] sm:inline-flex">
            Scheduled
          </span>
        )}
      </div>

      {/* 
          ORDER TYPE
       */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* ORDER NOW */}
        <Card
          role="button"
          tabIndex={0}
          onClick={handleOrderNowClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleOrderNowClick();
            }
          }}
          className={`
            relative
            cursor-pointer
            rounded-xl
            p-3
            transition-all
            active:scale-[0.98]
            sm:rounded-2xl
            sm:p-4
            ${
              orderTiming === "instant"
                ? "border-2 border-[#92251C] bg-[#92251C]/5 shadow-sm"
                : "border border-[#E8E1D8] bg-white hover:border-[#92251C]/40"
            }
          `}
        >
          {/* Selected indicator */}
          {orderTiming === "instant" && (
            <div className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#92251C]">
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </div>
          )}

          <div className="pr-6">
            <div className="text-sm font-bold text-[#241F1B] sm:text-base">
              Order Now
            </div>

            <div className="mt-1 text-[10px] leading-tight text-[#9A9086] sm:text-xs">
              {isRestaurantOpen
                ? "within two hours"
                : "Outside opening hours"}
            </div>
          </div>

          {!isRestaurantOpen && (
            <span className="mt-2 inline-flex rounded-full ] px-2 py-0.5 text-[9px] font-semibold text-[#B33A2E] sm:text-[10px]">
              Closed now
            </span>
          )}
        </Card>

        {/* ORDER IN ADVANCE */}
        <Card
          role="button"
          tabIndex={0}
          onClick={handleScheduleClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleScheduleClick();
            }
          }}
          className={`
            relative
            cursor-pointer
            rounded-xl
            p-3
            transition-all
            active:scale-[0.98]
            sm:rounded-2xl
            sm:p-4
            ${
              orderTiming === "scheduled"
                ? "border-2 border-[#92251C] bg-[#92251C]/5 shadow-sm"
                : "border border-[#E8E1D8] bg-white hover:border-[#92251C]/40"
            }
          `}
        >
          {/* Selected indicator */}
          {orderTiming === "scheduled" && (
            <div className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#92251C]">
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </div>
          )}

          <div className="pr-6">
            <div className="text-sm font-bold text-[#241F1B] sm:text-base">
              Advance Order
            </div>

            <div className="mt-1 truncate text-[10px] leading-tight text-[#9A9086] sm:text-xs">
              {orderTiming === "scheduled"
                ? scheduleLabel
                : "Schedule for later"}
            </div>
          </div>

          {orderTiming === "scheduled" && (
            <span className="mt-2 inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold text-[#287A52] sm:hidden">
              Scheduled
            </span>
          )}
        </Card>
      </div>

      {/* 
          SCHEDULED ORDER DETAILS
       */}
      {orderTiming === "scheduled" && (
        <button
          type="button"
          onClick={handleScheduleClick}
          className="
            mt-2.5
            flex
            w-full
            items-center
            justify-between
            gap-3
            rounded-xl
            border
            border-[#E8E1D8]
            bg-[#FFFCF8]
            px-3
            py-2.5
            text-left
            transition-colors
            hover:border-[#92251C]/30
            active:scale-[0.99]
            sm:mt-3
            sm:px-4
            sm:py-3
          "
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#92251C]/10 sm:h-9 sm:w-9">
              <Clock3 className="h-4 w-4 text-[#92251C]" />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-medium uppercase tracking-wide text-[#9A9086] sm:text-[11px]">
                Scheduled for
              </div>

              <div className="truncate text-sm font-semibold text-[#241F1B] sm:text-base">
                {scheduleLabel}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#92251C] sm:text-sm">
            <span>Change</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </button>
      )}

      {/* 
          ORDER TIME DIALOG
       */}
      <OrderTimeDialog
        open={showOrderTimeDialog}
        onClose={() => setShowOrderTimeDialog(false)}
        orderType={orderTimeType}
        setOrderType={setOrderTimeType}
        selectedDate={selectedOrderDate}
        setSelectedDate={setSelectedOrderDate}
        selectedSlot={selectedOrderSlot}
        setSelectedSlot={setSelectedOrderSlot}
        selectedDeliveryTime={selectedOrderDeliveryTime}
        setSelectedDeliveryTime={setSelectedOrderDeliveryTime}
        onConfirm={handleDialogConfirm}
      />
    </div>
  );
}