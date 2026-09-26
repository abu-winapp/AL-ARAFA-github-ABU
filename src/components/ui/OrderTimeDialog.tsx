"use client";

import * as React from "react";
import dayjs, { Dayjs } from "dayjs";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import ScheduleIcon from "@mui/icons-material/Schedule";

import {
  LocalizationProvider,
} from "@mui/x-date-pickers/LocalizationProvider";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";

import { useSettingsStore } from "../../lib/store/useSettingsStore";

type OrderType = "now" | "advance";

interface Props {
  open: boolean;
  onClose: () => void;

  orderType: OrderType;
  setOrderType: (type: OrderType) => void;

  selectedDate: Dayjs | null;
  setSelectedDate: (date: Dayjs | null) => void;

  selectedSlot: string;
  setSelectedSlot: (slot: string) => void;

  selectedDeliveryTime: string;
  setSelectedDeliveryTime: (time: string) => void;

  onConfirm: () => void;
}

const BRAND_RED = "#A40301";

<<<<<<< HEAD
const SLOT_INTERVAL_MINUTES = 30;
=======
const deliverySlots = [
  {
    id: "afternoon",
    label: "01:00 PM - 03:00 PM",
    times: [
      "01:00 PM",
      "01:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
    ],
  },
  {
    id: "evening",
    label: "07:00 PM - 09:00 PM",
    times: [
      "07:00 PM",
      "07:30 PM",
      "08:00 PM",
      "08:30 PM",
      "09:00 PM",
    ],
  },
];
>>>>>>> e1fc17189e3032fc01bb1a8cc251a3e2e5e59b45

export default function OrderTimeDialog({
  open,
  onClose,
  orderType,
  setOrderType,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
  selectedDeliveryTime,
  setSelectedDeliveryTime,
  onConfirm,
}: Props) {
  const [dateError, setDateError] = React.useState("");

  /*
   * Get order-hours information from the existing settings store.
   */
  const getOrderHours = useSettingsStore((state) => state.getOrderHours);

  const orderHours = getOrderHours();

  const serverTime = orderHours?.serverTime ?? null;
  const orderWindows = orderHours?.windows ?? [];

  /*
   * Convert a time such as "13:30" into "01:30 PM".
   */
  const formatTime = React.useCallback((time: string) => {
    const [hoursString, minutesString] = time.split(":");

    const hours = Number(hoursString);
    const minutes = Number(minutesString);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return time;
    }

    const period = hours >= 12 ? "PM" : "AM";

    const displayHour =
      hours % 12 === 0 ? 12 : hours % 12;

    return `${String(displayHour).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")} ${period}`;
  }, []);

  /*
   * Convert "HH:mm" into total minutes.
   *
   * Example:
   * "13:30" -> 810
   */
  const timeToMinutes = React.useCallback((time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
  }, []);

  /*
   * Generate 30-minute slots from each backend order window.
   *
   * Example backend window:
   *
   * 11:30 -> 15:00
   *
   * becomes:
   *
   * 11:30
   * 12:00
   * 12:30
   * 13:00
   * 13:30
   * 14:00
   * 14:30
   * 15:00
   */
  const deliverySlots = React.useMemo(() => {
    return orderWindows.map((window, index) => {
      const startMinutes = timeToMinutes(window.start);
      const endMinutes = timeToMinutes(window.end);

      const times: string[] = [];

      for (
        let minutes = startMinutes;
        minutes <= endMinutes;
        minutes += SLOT_INTERVAL_MINUTES
      ) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        const rawTime = `${String(hours).padStart(2, "0")}:${String(
          mins
        ).padStart(2, "0")}`;

        times.push(formatTime(rawTime));
      }

      return {
        id: `${window.name.toLowerCase().replace(/\s+/g, "-")}-${index}`,
        label: `${formatTime(window.start)} - ${formatTime(window.end)}`,
        start: window.start,
        end: window.end,
        times,
      };
    });
  }, [orderWindows, timeToMinutes, formatTime]);

  /*
   * Get the date supplied by the backend server.
   *
   * We intentionally don't use the browser's current date here.
   *
   * Example:
   * serverTime:
   * 2026-09-26T12:04:40+08:00
   *
   * serverDate:
   * 2026-09-26
   */
  const serverDate = React.useMemo(() => {
    if (!serverTime) {
      return null;
    }

    return serverTime.substring(0, 10);
  }, [serverTime]);

  /*
   * Check whether the selected date is the same calendar date
   * as the restaurant's server date.
   */
  const isToday = React.useCallback(() => {
    if (!selectedDate || !serverDate) {
      return false;
    }

    return selectedDate.format("YYYY-MM-DD") === serverDate;
  }, [selectedDate, serverDate]);

  /*
   * Convert "01:30 PM" back to "13:30".
   */
  const displayTimeTo24Hour = React.useCallback((time: string) => {
    const [timePart, period] = time.split(" ");

    const [hoursString, minutesString] = timePart.split(":");

    let hours = Number(hoursString);
    const minutes = Number(minutesString);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return null;
    }

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;
  }, []);

  /*
   * Check whether a particular delivery time has already passed.
   *
   * IMPORTANT:
   * We compare against the API's serverTime, not the browser's
   * local clock.
   *
   * Example:
   *
   * API serverTime:
   * 12:04 PM
   *
   * 12:00 PM -> disabled
   * 12:30 PM -> available
   */
  const isTimeAvailable = React.useCallback(
    (time: string) => {
      if (!selectedDate || !serverTime) {
        return false;
      }

      /*
       * Future dates don't need a "past time" check.
       */
      if (!isToday()) {
        return true;
      }

      const time24 = displayTimeTo24Hour(time);

      if (!time24) {
        return false;
      }

      /*
       * Build the selected slot using the SAME server date and
       * Singapore offset from the API.
       *
       * Example:
       *
       * 2026-09-26 + 13:30 +08:00
       */
      const serverOffset = serverTime.substring(19);

      const slotDateTime = dayjs(
        `${serverDate}T${time24}:00${serverOffset}`
      );

      const currentServerDateTime = dayjs(serverTime);

      return slotDateTime.isAfter(currentServerDateTime);
    },
    [
      selectedDate,
      serverTime,
      serverDate,
      isToday,
      displayTimeTo24Hour,
    ]
  );

  /*
   * Make sure the selected time is still valid.
   *
   * Example:
   *
   * User selects 12:30 PM at 12:20 PM.
   *
   * Later the server time becomes 12:31 PM.
   *
   * 12:30 PM should no longer remain selected.
   */
  React.useEffect(() => {
    if (
      orderType !== "advance" ||
      !selectedDeliveryTime ||
      !selectedDate
    ) {
      return;
    }

    if (isToday() && !isTimeAvailable(selectedDeliveryTime)) {
      setSelectedDeliveryTime("");
    }
  }, [
    orderType,
    selectedDate,
    selectedDeliveryTime,
    isToday,
    isTimeAvailable,
    setSelectedDeliveryTime,
  ]);

  /*
   * When the user changes the date, clear the previously selected
   * slot/time so an invalid combination isn't carried over.
   */
  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);

    setSelectedSlot("");
    setSelectedDeliveryTime("");

    if (!date) {
      setDateError("");
      return;
    }

    if (serverDate) {
      const selectedDateString = date.format("YYYY-MM-DD");

      if (selectedDateString < serverDate) {
        setDateError("Past dates are not allowed.");
        return;
      }
    }

    setDateError("");
  };

  /*
   * When the order type changes to "now", clear scheduling values.
   */
  const handleOrderTypeChange = (type: OrderType) => {
    setOrderType(type);

    if (type === "now") {
      setSelectedDate(null);
      setSelectedSlot("");
      setSelectedDeliveryTime("");
      setDateError("");
    }
  };

  /*
   * The Confirm button is enabled when:
   *
   * Order Now
   * OR
   * Advance + valid date + slot + time
   */
  const canConfirm =
    orderType === "now" ||
    (!!selectedDate &&
      !!selectedSlot &&
      !!selectedDeliveryTime &&
      !dateError &&
      isTimeAvailable(selectedDeliveryTime));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      {/* Header */}
      <DialogTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <AccessTimeIcon sx={{ color: BRAND_RED }} />

          Select Order Time
        </div>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers>
        {/* Order Type Options */}
        <div className="grid gap-3 md:grid-cols-2">
          {/* Order Now */}
          <button
            type="button"
            onClick={() => handleOrderTypeChange("now")}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
              orderType === "now"
                ? "border-[#A40301] bg-red-50"
                : "border-gray-200 hover:border-[#A40301]/60 hover:bg-red-50/40"
            }`}
          >
            <FlashOnIcon sx={{ color: BRAND_RED }} />

            <div>
              <p className="font-semibold">
                Order Now
              </p>

              <p className="text-xs text-gray-500">
                Prepare immediately
              </p>
            </div>
          </button>

          {/* Order in Advance */}
          <button
            type="button"
            onClick={() =>
              handleOrderTypeChange("advance")
            }
            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
              orderType === "advance"
                ? "border-[#A40301] bg-red-50"
                : "border-gray-200 hover:border-[#A40301]/60 hover:bg-red-50/40"
            }`}
          >
            <ScheduleIcon sx={{ color: BRAND_RED }} />

            <div>
              <p className="font-semibold">
                Order in Advance
              </p>

              <p className="text-xs text-gray-500">
                Schedule for later
              </p>
            </div>
          </button>
        </div>

        {/* Scheduler */}
        {orderType === "advance" && (
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
          >
            <div className="mt-5 space-y-4">
              {/* Date */}
              <DatePicker
                label="Delivery Date"
                value={selectedDate}
                onChange={handleDateChange}
                disablePast
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    error: !!dateError,
                    helperText: dateError,
                  },
                }}
              />

              {/* Delivery Window */}
              <FormControl
                fullWidth
                size="small"
                disabled={!selectedDate}
              >
                <InputLabel>
                  Delivery Slot
                </InputLabel>

                <Select
                  value={selectedSlot}
                  label="Delivery Slot"
                  onChange={(e: SelectChangeEvent) => {
                    setSelectedSlot(
                      String(e.target.value)
                    );

                    setSelectedDeliveryTime("");
                  }}
                >
                  {deliverySlots.map((slot) => (
                    <MenuItem
                      key={slot.id}
                      value={slot.id}
                    >
                      {slot.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Delivery Time */}
              <FormControl
                fullWidth
                size="small"
                disabled={
                  !selectedSlot ||
                  !selectedDate
                }
              >
                <InputLabel>
                  Delivery Time
                </InputLabel>

                <Select
                  value={selectedDeliveryTime}
                  label="Delivery Time"
                  onChange={(e: SelectChangeEvent) => {
                    setSelectedDeliveryTime(
                      String(e.target.value)
                    );
                  }}
                >
                  {deliverySlots
                    .find(
                      (slot) =>
                        slot.id === selectedSlot
                    )
                    ?.times.map((time) => {
                      const available =
                        isTimeAvailable(time);

                      return (
                        <MenuItem
                          key={time}
                          value={time}
                          disabled={!available}
                        >
                          {time}
                          {!available &&
                            isToday() && (
                              <span className="ml-2 text-xs text-gray-400">
                                Unavailable
                              </span>
                            )}
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>

              {/* Selected Schedule Summary */}
              {selectedDate &&
                selectedSlot &&
                selectedDeliveryTime && (
                  <div className="rounded-lg border border-[#A40301]/20 bg-red-50 p-3 text-sm">
                    <p>
                      <b>Date:</b>{" "}
                      {selectedDate.format(
                        "DD MMM YYYY"
                      )}
                    </p>

                    <p>
                      <b>Slot:</b>{" "}
                      {
                        deliverySlots.find(
                          (slot) =>
                            slot.id ===
                            selectedSlot
                        )?.label
                      }
                    </p>

                    <p>
                      <b>Time:</b>{" "}
                      {selectedDeliveryTime}
                    </p>
                  </div>
                )}

              {/* Backend server time information */}
              {serverTime && (
                <p className="text-xs text-gray-500">
                  Scheduling based on restaurant time (
                  {orderHours?.timezone || "local time"}
                  ).
                </p>
              )}

              {/* No windows configured */}
              {selectedDate &&
                deliverySlots.length === 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    No delivery time slots are currently
                    available.
                  </div>
                )}
            </div>
          </LocalizationProvider>
        )}
      </DialogContent>

      {/* Footer */}
      <DialogActions className="p-4">
        <Button
          onClick={onClose}
          color="inherit"
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          disabled={!canConfirm}
          onClick={onConfirm}
          sx={{
            backgroundColor: BRAND_RED,

            "&:hover": {
              backgroundColor: "#7f0301",
            },

            "&.Mui-disabled": {
              backgroundColor: "#e0e0e0",
            },
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}