//we use client because this component uses MUI components that needed to run on client-side.

"use client";

//import mui components
import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import ScheduleIcon from "@mui/icons-material/Schedule";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";


import { Dayjs } from "dayjs";

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

const deliverySlots = [
  {
    id: "slot1",
    label: "11:00 AM - 02:00 PM",
    times: [
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "01:00 PM",
      "01:30 PM",
      "02:00 PM",
    ],
  },
  {
    id: "slot2",
    label: "02:00 PM - 05:00 PM",
    times: [
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM",
      "05:00 PM",
    ],
  },
  {
    id: "slot3",
    label: "05:00 PM - 08:00 PM",
    times: [
      "05:00 PM",
      "05:30 PM",
      "06:00 PM",
      "06:30 PM",
      "07:00 PM",
      "07:30 PM",
      "08:00 PM",
    ],
  },
  {
    id: "slot4",
    label: "08:00 PM - 10:00 PM",
    times: [
      "08:00 PM",
      "08:30 PM",
      "09:00 PM",
      "09:30 PM",
      "10:00 PM",
    ],
  },
];

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

 
 const canConfirm =
  orderType === "now" ||
  (!!selectedDate &&
    !!selectedSlot &&
    !!selectedDeliveryTime &&
    !dateError);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
        {/* Options */}
        <div className="grid gap-3 md:grid-cols-2">
          {/* Order Now */}
          <button
            onClick={() => setOrderType("now")}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
              orderType === "now"
                ? "border-[#A40301] bg-red-50"
                : "border-gray-200 hover:border-[#A40301]/60 hover:bg-red-50/40"
            }`}
          >
            <FlashOnIcon sx={{ color: BRAND_RED }} />
            <div>
              <p className="font-semibold">Order Now</p>
              <p className="text-xs text-gray-500">Prepare immediately</p>
            </div>
          </button>

          {/* Advance */}
          <button
            onClick={() => setOrderType("advance")}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
              orderType === "advance"
                ? "border-[#A40301] bg-red-50"
                : "border-gray-200 hover:border-[#A40301]/60 hover:bg-red-50/40"
            }`}
          >
            <ScheduleIcon sx={{ color: BRAND_RED }} />
            <div>
              <p className="font-semibold">Order in Advance</p>
              <p className="text-xs text-gray-500">Schedule for later</p>
            </div>
          </button>
        </div>

        {/* Scheduler */}
        {orderType === "advance" && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="mt-5 space-y-4">
              <DatePicker
                label="Delivery Date"
                value={selectedDate}
                onChange={setSelectedDate}
                disablePast
                format="DD/MM/YYYY"
                onError={(reason) => {
                  if (reason === "disablePast") {
                    setDateError("Past dates are not allowed.");
                  } else if (reason === "invalidDate") {
                    setDateError("Please enter a valid date.");
                  } else {
                    setDateError("");
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    error: !!dateError,
                    helperText: dateError,
                  },
                }}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Delivery Slot</InputLabel>

                <Select
                  value={selectedSlot}
                  label="Delivery Slot"
                  onChange={(e: SelectChangeEvent) => {
                    setSelectedSlot(String(e.target.value));
                    setSelectedDeliveryTime("");
                  }}
                >
                  {deliverySlots.map((slot) => (
                    <MenuItem key={slot.id} value={slot.id}>
                      {slot.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" disabled={!selectedSlot}>
                <InputLabel>Delivery Time</InputLabel>

                <Select
                  value={selectedDeliveryTime}
                  label="Delivery Time"
                  onChange={(e: SelectChangeEvent) =>
                    setSelectedDeliveryTime(String(e.target.value))
                  }
                >
                  {deliverySlots
                    .find((slot) => slot.id === selectedSlot)
                    ?.times.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                    
                </Select>
              </FormControl>

              {selectedDate && selectedSlot && selectedDeliveryTime && (
                <div className="rounded-lg border border-[#A40301]/20 bg-red-50 p-3 text-sm">
                  <p>
                    <b>Date:</b> {selectedDate.format("DD MMM YYYY")}
                  </p>

                  <p>
                    <b>Slot:</b>{" "}
                    {
                      deliverySlots.find((slot) => slot.id === selectedSlot)
                        ?.label
                    }
                  </p>

                  <p>
                    <b>Time:</b> {selectedDeliveryTime}
                  </p>
                </div>
              )}
            </div>
          </LocalizationProvider>
        )}
      </DialogContent>

      {/* Footer */}
      <DialogActions className="p-4">
        <Button onClick={onClose} color="inherit">
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




