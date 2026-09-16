/**
 * Al-Arafa Restaurant - Order In Advance Section Component
 * Displays the selected order date/time for advance orders
 */

'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import OrderTimeDialog from '@/components/ui/OrderTimeDialog';
import { useCartStore } from '@/lib/store/useCartStore';
import dayjs, { type Dayjs } from 'dayjs';

interface OrderInAdvanceSectionProps {
  onTimeChange?: () => void;
}

export function OrderInAdvanceSection({ onTimeChange }: OrderInAdvanceSectionProps) {
  const {
    cart,
    getFulfillmentType,
    orderTiming,
    getAdvanceOrderSchedule,
    setAdvanceOrderSchedule,
  } = useCartStore();

  const [showOrderTimeDialog, setShowOrderTimeDialog] = useState(false);
  const [orderTimeType, setOrderTimeType] = useState<'advance' | 'now'>('advance');
  const [selectedOrderDate, setSelectedOrderDate] = useState<Dayjs | null>(dayjs());
  const [selectedOrderSlot, setSelectedOrderSlot] = useState('');
  const [selectedOrderDeliveryTime, setSelectedOrderDeliveryTime] = useState('');

  // Determine menuType from cart items
  const menuType = cart?.items?.[0]?.menuType;

  // Only show if:
  // 1. Cart has items (regular menu)
  // 2. Delivery is selected
  // 3. Order timing is set to "scheduled" (independent of delivery provider)
  const shouldShow =
    cart &&
    cart.items &&
    cart.items.length > 0 &&
    menuType === 'regular' &&
    getFulfillmentType('regular') === 'delivery' &&
    orderTiming === 'scheduled';

  if (!shouldShow) {
    return null;
  }

  const advanceSchedule = getAdvanceOrderSchedule();
  
  // Format the display text
  const orderTimeLabel = advanceSchedule
    ? `${dayjs(advanceSchedule.scheduledDate).format('DD MMM YYYY')} at ${advanceSchedule.scheduledTime}`
    : 'No schedule selected yet';

  const handleChangeClick = () => {
    setOrderTimeType('advance');
    setShowOrderTimeDialog(true);
  };

  const handleConfirm = () => {
    setShowOrderTimeDialog(false);

    // Save the advance schedule to cart store
    if (selectedOrderDate && selectedOrderDeliveryTime) {
      // Convert "12:30 PM" → "12:30" (24h) for the API
      const parsed = selectedOrderDate
        .hour(
          parseInt(selectedOrderDeliveryTime.split(':')[0]) +
            (selectedOrderDeliveryTime.includes('PM') &&
            !selectedOrderDeliveryTime.startsWith('12')
              ? 12
              : selectedOrderDeliveryTime.includes('AM') &&
                selectedOrderDeliveryTime.startsWith('12')
              ? -12
              : 0)
        )
        .minute(parseInt(selectedOrderDeliveryTime.split(':')[1]));
      
      const scheduledDate = selectedOrderDate.format('YYYY-MM-DD');
      const scheduledTime = parsed.format('HH:mm');
      
      setAdvanceOrderSchedule(scheduledDate, scheduledTime);
      
      if (onTimeChange) {
        onTimeChange();
      }
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Order in Advance</h3>

      <Card className="p-4 border-2 border-primary bg-primary/5">
        <div className="space-y-3">
          {/* Schedule Display */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-text-secondary" />
              <span className="text-text-secondary">{orderTimeLabel}</span>
            </div>
            <button
              type="button"
              onClick={handleChangeClick}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Change
            </button>
          </div>

          {/* Price */}
          <div className="font-semibold text-text-primary">S$ 0.00</div>
        </div>
      </Card>

      {/* Order Time Dialog */}
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
        onConfirm={handleConfirm}
      />
    </div>
  );
}
