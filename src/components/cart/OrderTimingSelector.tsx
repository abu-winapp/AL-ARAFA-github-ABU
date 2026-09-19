"use client";

import { useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useCartStore } from "@/lib/store/useCartStore";
import { Card } from "@/components/ui/card";
import OrderTimeDialog from "@/components/ui/OrderTimeDialog";
import { Clock } from "lucide-react";

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

  const scheduleLabel =
    advanceSchedule?.scheduledDate && advanceSchedule?.scheduledTime
      ? `${dayjs(advanceSchedule.scheduledDate).format("DD MMM YYYY")} at ${advanceSchedule.scheduledTime}`
      : "Pick a date and time";

  const handleOrderNowClick = () => {
    clearAdvanceOrderSchedule();
  };

  const handleScheduleClick = () => {
    setOrderTimeType("advance");
    setShowOrderTimeDialog(true);
  };

  const handleDialogConfirm = () => {
    setShowOrderTimeDialog(false);

    if (
      orderTimeType === "advance" &&
      selectedOrderDate &&
      selectedOrderDeliveryTime
    ) {
      const parts = selectedOrderDeliveryTime.split(":");
      const rawHour = parseInt(parts[0], 10);
      const isPM = selectedOrderDeliveryTime.includes("PM");
      const isAM = selectedOrderDeliveryTime.includes("AM");

      let hour = rawHour;
      if (isPM && rawHour !== 12) {
        hour += 12;
      } else if (isAM && rawHour === 12) {
        hour = 0;
      }

      const minute = parseInt(parts[1], 10);
      const scheduledDate = selectedOrderDate.format("YYYY-MM-DD");
      const scheduledTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

      setAdvanceOrderSchedule(scheduledDate, scheduledTime);
    } else if (orderTimeType === "now") {
      clearAdvanceOrderSchedule();
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-text-primary mb-3">
        When do you want your order?
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card
          className={`p-4 cursor-pointer transition-all ${
            orderTiming === "instant"
              ? "border-2 border-[#92251C] bg-[#92251C]/5"
              : "border border-border-light hover:border-[#92251C]/40"
          }`}
          onClick={handleOrderNowClick}
        >
          <div className="flex items-center justify-between">
            <div className="font-semibold text-text-primary">Order Now</div>
            {!isRestaurantOpen && (
              <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                Closed Now
              </span>
            )}
          </div>
          <div className="text-xs text-text-secondary mt-1">
            {isRestaurantOpen ? "As soon as possible" : "Outside opening hours"}
          </div>
        </Card>

        <Card
          className={`p-4 cursor-pointer transition-all ${
            orderTiming === "scheduled"
              ? "border-2 border-[#92251C] bg-[#92251C]/5"
              : "border border-border-light hover:border-[#92251C]/40"
          }`}
          onClick={handleScheduleClick}
        >
          <div className="flex items-center justify-between">
            <div className="font-semibold text-text-primary">
              Order in Advance
            </div>
            {orderTiming === "scheduled" && (
              <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                Scheduled
              </span>
            )}
          </div>
          <div className="text-xs text-text-secondary mt-1 truncate">
            {orderTiming === "scheduled" ? scheduleLabel : "Schedule for later"}
          </div>
        </Card>
      </div>

      {orderTiming === "scheduled" && (
        <div className="flex items-center justify-between gap-3 bg-[#FFFCF8] rounded-xl border border-[#E8E1D8] p-3.5 mb-2">
          <div className="flex items-center gap-2.5 text-sm text-[#241F1B] min-w-0">
            <Clock className="h-4 w-4 shrink-0 text-[#92251C]" />
            <span className="truncate">
              Scheduled for{" "}
              <span className="font-semibold">{scheduleLabel}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleScheduleClick}
            className="text-xs font-bold text-[#92251C] hover:underline shrink-0"
          >
            Change Time
          </button>
        </div>
      )}

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

