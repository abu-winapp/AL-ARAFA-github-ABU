"use client";

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
    label: "12:00 PM - 03:00 PM",
    times: ["12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM"],
  },
  {
    id: "slot2",
    label: "03:00 PM - 05:00 PM",
    times: ["03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"],
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
  const canConfirm =
    orderType === "now" ||
    (selectedDate && selectedSlot && selectedDeliveryTime);

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
                slotProps={{
                  textField: { fullWidth: true, size: "small" },
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
                    {deliverySlots.find((slot) => slot.id === selectedSlot)?.label}
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


Great! Now we know there were **two separate issues**, and together they caused the confusing behavior.

---

# 1. We fixed the Zustand subscription

### Before

```tsx
const fulfillmentType = getFulfillmentType("regular");
```

`getFulfillmentType()` is just a function that internally calls Zustand's `get()`. It reads the current value, but React isn't explicitly subscribed to `fulfillmentTypes.regular`.

So changing:

```
Delivery
↓
Pickup
↓
Delivery
```

didn't always cause the component to update correctly.

### After

```tsx
const fulfillmentType = useCartStore(
  (state) => state.fulfillmentTypes.regular
);
```

Now the component is directly subscribed to `fulfillmentTypes.regular`.

Whenever `setFulfillmentType()` updates that value, React rerenders the component immediately.

---

# 2. We fixed the `useEffect` dependencies

### Before

```tsx
useEffect(() => {
  if (shouldShow && deliveryAddress) {
    fetchDeliveryQuotes(deliveryAddress.id);
  }
}, [deliveryAddress?.id, fetchDeliveryQuotes]);
```

This effect only ran when:

* the address changed, or
* `fetchDeliveryQuotes` changed.

Imagine this sequence:

```
Self Collect
↓
Home Delivery
```

The address didn't change.

`fetchDeliveryQuotes` didn't change.

So the effect **never ran**, meaning no new delivery quotes were fetched.

Your UI then showed:

> No delivery providers available

because it still had no quotes.

---

### After

```tsx
useEffect(() => {
  if (!shouldShow || !deliveryAddress) return;

  fetchDeliveryQuotes(deliveryAddress.id);
}, [
  shouldShow,
  deliveryAddress?.id,
  fetchDeliveryQuotes,
]);
```

Now the effect also depends on:

```tsx
shouldShow
```

When the user switches:

```
Pickup
↓
Delivery
```

`shouldShow` changes from `false` to `true`.

That causes the effect to run again and fetch fresh delivery quotes.

---

# Why did a page refresh always fix it?

A refresh mounts the component from scratch.

On mount, the effect runs regardless of previous state, so `fetchDeliveryQuotes()` executes and the providers appear.

That's why refreshing seemed to "fix" it—it wasn't fixing the data, it was forcing the effect to run again.

---

# The lesson

There are two important React/Zustand principles here:

* **Subscribe to state, not getter functions.** In React components, prefer selectors like `useCartStore((s) => s.fulfillmentTypes.regular)` over custom getter methods.
* **Include every value your effect uses that should trigger a refetch.** Here, the fetch wasn't just dependent on the address—it also depended on whether delivery mode was active (`shouldShow`).

These two changes made the UI reactive to fulfillment mode changes and ensured delivery quotes are fetched whenever delivery becomes active again.




--------------------------------------------------------------------------------------------------


From the beginning of this Cart page debugging, we were mainly fixing the **order hours / settings flow** and checking Cart page issues. Here is the full progress:

---

## 1. Cart Page Audit Started

We reviewed your `CartContent()` in:

```
src/app/cart/page.tsx
```

Main areas checked:

* Cart loading
* Address loading
* Settings loading
* Delivery selection
* Delivery quotes
* GST calculation
* Service charge calculation
* Order availability window
* Checkout button blocking logic

---

# Completed Changes

## ✅ 1. Fixed Cart initialization flow

Before:

```ts
useEffect(() => {
  fetchCart();
  loadAddresses();
  fetchAllSettings();
}, [fetchCart, fetchAllSettings]);
```

Problem:

* Zustand functions can trigger unnecessary reruns because function references can change.
* Multiple API calls could happen.
* Loading order was not controlled.

Changed to:

```ts
useEffect(() => {
  const init = async () => {
    await fetchCart();
    await loadAddresses();
    await fetchAllSettings();
  };

  init();
}, []);
```

Result:

```
Cart Page Load
      |
      ↓
fetchCart()
      |
      ↓
loadAddresses()
      |
      ↓
fetchAllSettings()
```

---

# 2. Address loading logic checked

File:

```
src/app/cart/page.tsx
```

Function:

```ts
const loadAddresses = async () => {
```

Current flow:

1. Fetch user addresses

```ts
const data = await addressService.getAddresses();
```

2. Save addresses

```ts
setAddresses(data);
```

3. Restore selected address:

Priority:

```
Selected cart address
        ↓
Default address
        ↓
First address
        ↓
null
```

Code:

```ts
const selected =
  (currentSelectedId &&
    data.find(
      addr => String(addr.id) === String(currentSelectedId)
    ))
  ||
  data.find(addr => addr.isDefault)
  ||
  data[0]
  ||
  null;
```

This part is correct.

---

# 3. Found Order Hours naming mismatch

Backend response:

```json
{
  "order_hours": {
    "server_time": "...",
    "timezone": "Asia/Singapore",
    "accepting_orders_now": true,
    "windows":[]
  }
}
```

Frontend wanted:

```ts
order_hours
```

Problem:

Your type:

```ts
export interface AllSettings {
   order_hours: order_hoursConfig;
}
```

but store:

```ts
get().settings?.order_hours
```

Mismatch:

```
Backend
order_hours

Type
order_hours

Store
order_hours ❌
```

---

# 4. Decided to convert snake_case → camelCase

Architecture chosen:

```
Backend
(order_hours)
      |
      |
settings.service.ts
(convert here)
      |
      |
Frontend
(order_hours)
```

This is the correct approach.

---

# 5. Planned Type changes

Change:

```ts
export interface AllSettings {
  order_hours: order_hoursConfig;
}
```

to:

```ts
export interface AllSettings {
  order_hours: order_hoursConfig;
}
```

---

Change:

```ts
export interface OrderHoursConfig {
  server_time:string;
  accepting_orders_now:boolean;
}
```

to:

```ts
export interface OrderHoursConfig {
  serverTime:string;
  acceptingOrdersNow:boolean;
}
```

---

# 6. Planned API mapper

File:

```
src/lib/api/settings.service.ts
```

Currently:

```ts
export async function getAllSettings(): Promise<AllSettings> {
 const response = await apiClient.get('/settings');
 return response.data.data;
}
```

Problem:

It directly returns backend format.

Need:

```ts
export async function getAllSettings(): Promise<AllSettings> {

 const response = await apiClient.get('/settings');

 const data = response.data.data;

 return {
   ...data,

   order_hours:{
      serverTime:data.order_hours.server_time,
      timezone:data.order_hours.timezone,
      acceptingOrdersNow:
        data.order_hours.accepting_orders_now,
      windows:data.order_hours.windows
   }
 };
}
```

---

# 7. Planned Zustand updates

File:

```
src/lib/store/useSettingsStore.ts
```

Change:

```ts
get().settings?.order_hours?.accepting_orders_now
```

to:

```ts
get().settings?.order_hours?.acceptingOrdersNow
```

Change:

```ts
get().settings?.order_hours?.server_time
```

to:

```ts
get().settings?.order_hours?.serverTime
```

---

# Current Status

| Area                           | Status         |
| ------------------------------ | -------------- |
| Cart page review               | ✅ Done         |
| Address loading                | ✅ Good         |
| Cart initialization            | ✅ Improved     |
| Delivery logic                 | ✅ Good         |
| GST/service charge logic       | ✅ Good         |
| Order hours problem identified | ✅ Done         |
| API mapper                     | ⏳ Not yet done |
| Type conversion                | ⏳ Not yet done |
| Zustand camelCase update       | ⏳ Not yet done |

---

## Next step

We should complete these 3 files:

1. `src/types/index.ts`

   * rename `order_hours` → `order_hours`
   * rename nested fields

2. `src/lib/api/settings.service.ts`

   * add mapper

3. `src/lib/store/useSettingsStore.ts`

   * update field names

After that, Cart page order timing feature will be fully aligned.
