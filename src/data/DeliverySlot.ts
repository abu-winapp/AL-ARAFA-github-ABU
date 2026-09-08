export interface DeliverySlot {
  id: string;
  label: string;
  start: string;
  end: string;
  interval: number;
}

export const deliverySlots: DeliverySlot[] = [
  {
    id: "slot1",
    label: "12:00 PM - 03:00 PM",
    start: "12:00",
    end: "15:00",
    interval: 30,
  },
  {
    id: "slot2",
    label: "03:00 PM - 05:00 PM",
    start: "15:00",
    end: "17:00",
    interval: 30,
  },
];