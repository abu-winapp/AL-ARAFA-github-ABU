/**
 * Al-Arafa Restaurant - Redesigned Cart Page (Stage 1)
 * Answers: "What am I ordering?"
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, Plus, Clock, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CartItem } from '@/components/cart/CartItem';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { PriceBreakdown } from '@/components/checkout/PriceBreakdown';
import { StickyCheckoutBar } from '@/components/checkout/StickyCheckoutBar';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { allowCheckout } from '@/lib/checkout/guard';

function CartContent() {
  const router = useRouter();
  const { cart, isLoading, fetchCart, getItemCount } = useCartStore();
  const { isAuthenticated, isInitialized } = useAuthStore();

  const {
    fetchAllSettings,
    getMinOrderForDelivery,
    getGSTRate,
    isGSTEnabled,
    getGST,
    getPointsPerDollar,
    getCateringMinLeadHours,
    getServiceChargeValue,
    getServiceCharge,
    getServiceChargeType,
    getOrderWindows,
    getAcceptingOrdersNow,
    getServerTime,
  } = useSettingsStore();

  const [orderStatusReady, setOrderStatusReady] = useState(false);
  const initialized = useRef(false);

  // Initialize fresh settings and cart
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      try {
        await fetchAllSettings(true);
        await fetchCart();
        setOrderStatusReady(true);
      } catch (err) {
        console.error('Failed to initialize cart settings:', err);
      }
    };

    init();
  }, [fetchCart, fetchAllSettings]);

  const itemCount = getItemCount();
  const menuType = cart?.items?.[0]?.menuType || 'regular';

  const orderWindows = getOrderWindows();
  const acceptingOrders = getAcceptingOrdersNow();
  const serverTime = getServerTime();
  const minOrderForDelivery = getMinOrderForDelivery();

  // Operating window check
  const isCurrentTimeInsideWindow = useCallback(
    (windows: typeof orderWindows, sTime: string) => {
      const currentTime = new Date(sTime);
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

      for (const window of windows) {
        const [startHour, startMinute] = window.start.split(':').map(Number);
        const [endHour, endMinute] = window.end.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
          return true;
        }
      }
      return false;
    },
    [],
  );

  const insideOrderWindow = serverTime
    ? isCurrentTimeInsideWindow(orderWindows, serverTime)
    : false;

  const canCheckout = orderStatusReady && Boolean(acceptingOrders) && insideOrderWindow;

  // Taxes & Charges Calculations
  const gstRate = getGSTRate();
  const gstEnabled = isGSTEnabled();
  const serviceChargeValue = getServiceChargeValue();
  const serviceChargeType = getServiceChargeType();
  const pointsPerDollar = getPointsPerDollar();
  const cateringMinLeadHours = getCateringMinLeadHours();

  const subtotal = cart?.subtotal ?? 0;
  const serviceCharge = subtotal > 0 && serviceChargeValue > 0 ? getServiceCharge(subtotal) : 0;
  const platformFee = cart?.platformFee ?? 0;
  const taxableAmount = subtotal + serviceCharge + platformFee;
  const calculatedGST = gstEnabled ? getGST(taxableAmount) : 0;
  const estimatedTotal = taxableAmount + calculatedGST;

  const pointsEarned = Math.floor(subtotal * pointsPerDollar);

  // Formatting hours
  const formatTime = (time: string) =>
    new Date(`2000-01-01T${time}`).toLocaleTimeString('en-SG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const handleContinueToOptions = () => {
    allowCheckout();

    if (isAuthenticated) {
      router.push('/checkout?step=options');
    } else {
      router.push('/?login=true&redirect=' + encodeURIComponent('/checkout?step=options'));
    }
  };

  const getCtaLabel = () => {
    if (!orderStatusReady) return 'Checking Status...';
    if (!acceptingOrders) return 'Restaurant Closed';
    if (!insideOrderWindow) return 'Outside Order Hours';
    return 'Continue to Options →';
  };

  const isCtaDisabled = !canCheckout;

  // Loading Screen
  if (isLoading && !cart) {
    return (
      <div className="min-h-screen bg-[#FBF8F4] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-3 border-[#95221C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-[#5C524B]">
            {!isInitialized ? 'Connecting...' : 'Loading your cart...'}
          </p>
        </div>
      </div>
    );
  }

  // Empty Cart Screen
  if (!cart || itemCount === 0) {
    return (
      <div className="min-h-screen bg-[#FBF8F4] flex flex-col justify-center items-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FAF3E0] border border-[#F0DFBE] flex items-center justify-center mx-auto mb-6 text-3xl sm:text-4xl shadow-sm">
            🍛
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1613] mb-2">
            Your cart is empty
          </h1>

          <p className="text-sm sm:text-base text-[#5C524B] mb-8 leading-relaxed">
            Discover our signature dum biryanis, aromatic curries, and authentic South Indian delicacies.
          </p>

          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#95221C] hover:bg-[#7D1B16] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(149,34,28,0.22)] transition-all active:scale-[0.98]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F4] pb-32 md:pb-20">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        {/* Checkout Progression Tracker */}
        <div className="mb-6 sm:mb-8">
          <CheckoutProgress currentStep="cart" />
        </div>

        {/* Page Title Row */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#EAE2D5]">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1613]">
              Your Cart
            </h1>
            <p className="text-xs sm:text-sm text-[#5C524B] mt-0.5">
              Review your order before choosing delivery or pickup options
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FAF3E0] text-[#7A5B14] border border-[#F0DFBE]">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
        {/* Order Hours Alert Banner if outside window */}
        {!canCheckout && orderStatusReady && (
          <div className="mb-6 p-4 rounded-2xl border border-[#F1D49A] bg-[#FFF9ED] flex items-start gap-3.5 shadow-sm">
            <Clock className="w-5 h-5 text-[#B88E34] shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <h4 className="font-bold text-[#634208]">
                {!acceptingOrders ? 'Currently Closed for Ordering' : 'Outside Operating Hours'}
              </h4>
              <p className="text-[#855B14] mt-0.5">
                We are currently not accepting new orders. Please visit us during our service hours:
              </p>
              {orderWindows.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {orderWindows.map((win) => (
                    <span
                      key={win.name}
                      className="inline-block bg-[#FFFFFF] px-2.5 py-1 rounded-md text-xs font-semibold text-[#634208] border border-[#F0DFBE]"
                    >
                      {win.name}: {formatTime(win.start)} - {formatTime(win.end)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Catering Notice if catering order */}
        {menuType === 'catering' && (
          <div className="mb-6 p-4 rounded-2xl border border-[#C5E8D4] bg-[#E8F5EE] flex items-start gap-3.5 shadow-sm">
            <Sparkles className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-[#1B4D36]">
              <h4 className="font-bold">Catering Package Order</h4>
              <p className="mt-0.5">
                Catering orders require at least {cateringMinLeadHours} hours advance notice for special preparation. You will pick your exact date and time in the next step.
              </p>
            </div>
          </div>
        )}

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Items (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-base sm:text-lg font-bold text-[#1C1613]">
                Order Items ({itemCount})
              </h2>
              <Link
                href="/menu"
                className="text-xs sm:text-sm font-semibold text-[#95221C] hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add More</span>
              </Link>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Add More Items Button Banner */}
            <div className="pt-2">
              <Link
                href="/menu"
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-[#EAE2D5] bg-[#FFFFFF]/60 hover:bg-[#FFFFFF] hover:border-[#95221C]/40 text-[#95221C] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add More Items From Menu</span>
              </Link>
            </div>

            {/* Delivery hint */}
            {minOrderForDelivery > 0 && (
              <p className="text-xs text-[#8E8279] pl-1">
                * Note: Minimum order for home delivery is S$ {minOrderForDelivery.toFixed(2)}. Delivery partner & timing are chosen in the next step.
              </p>
            )}
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-[#FFFFFF] border border-[#EAE2D5] rounded-2xl p-5 sm:p-6 shadow-sm">
              <h3 className="font-bold text-base sm:text-lg text-[#1C1613] pb-4 mb-4 border-b border-[#F0EBE3]">
                Price Summary
              </h3>

              {/* Price Breakdown */}
              <PriceBreakdown
                subtotal={subtotal}
                platformFee={platformFee}
                serviceCharge={serviceCharge}
                serviceChargeRate={serviceChargeValue}
                serviceChargeType={serviceChargeType}
                gstAmount={calculatedGST}
                gstRate={gstRate}
                gstEnabled={gstEnabled}
                total={estimatedTotal}
                pointsEarned={pointsEarned}
                isDelivery={false}
              />

              {/* Next Step Teaser */}
              <div className="mt-5 p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE2D5] text-xs text-[#5C524B]">
                <span className="font-bold text-[#1C1613] block mb-0.5">
                  Next: Choose Delivery or Pickup
                </span>
                Fulfillment method, live delivery partner rates, and preferred order timing will be configured in the next step.
              </div>

              {/* Desktop Continue CTA */}
              <div className="hidden md:block mt-5 pt-2">
                <button
                  type="button"
                  disabled={isCtaDisabled}
                  onClick={handleContinueToOptions}
                  className={`
                    w-full py-4 px-6 rounded-xl font-bold text-base text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2
                    ${
                      isCtaDisabled
                        ? 'bg-[#B0A79E] opacity-60 cursor-not-allowed shadow-none'
                        : 'bg-[#95221C] hover:bg-[#7D1B16] shadow-[0_4px_16px_rgba(149,34,28,0.22)] active:scale-[0.99]'
                    }
                  `}
                >
                  <span>{getCtaLabel()}</span>
                  {canCheckout && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>

              {/* Security guarantee */}
              <div className="mt-4 pt-4 border-t border-[#F0EBE3] flex items-center justify-center gap-2 text-xs text-[#2D6A4F]">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-medium">Direct Restaurant Ordering • Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Checkout Action */}
      <StickyCheckoutBar
        total={estimatedTotal}
        ctaText={getCtaLabel()}
        onCtaClick={handleContinueToOptions}
        disabled={isCtaDisabled}
        itemCount={itemCount}
        hintText="Subtotal + Tax"
        errorText={!canCheckout && orderStatusReady ? (!acceptingOrders ? 'Restaurant Closed' : 'Outside Order Hours') : undefined}
      />
    </div>
  );
}

export default function ProtectedCartPage() {
  return (
    <ProtectedRoute customerOnly>
      <CartContent />
    </ProtectedRoute>
  );
}
