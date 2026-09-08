/**
 * Al-Arafa Restaurant - Order Tracking Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { OrderStatus } from '@/components/order/OrderStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Order, DeliveryBooking, PaymentStatus, PaymentMethod } from '@/types';
import * as orderService from '@/lib/api/order.service';
import * as deliveryService from '@/lib/api/delivery.service';
import * as paymentService from '@/lib/api/payment.service';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useSettingsStore } from '@/lib/store/useSettingsStore';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState<DeliveryBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRepaying, setIsRepaying] = useState(false);
  const [repayError, setRepayError] = useState<string | null>(null);

  const { isAuthenticated, isInitialized } = useAuthStore();
  const { fetchAllSettings, getGSTRate, isGSTEnabled, getPointsPerDollar } = useSettingsStore();

  // Check if returning from payment
  const isPaymentReturn = searchParams.get('payment') === 'return';
  const hasPaymentError = searchParams.get('payment_error') === 'true';
  const paymentStatus = searchParams.get('payment_status'); // 'success', 'failed', 'pending'

  // Helper function to format payment method names
  const formatPaymentMethod = (method: PaymentMethod | undefined): string => {
    if (!method) return 'N/A';
    const methodMap: Record<PaymentMethod, string> = {
      card: 'Credit/Debit Card',
      paynow: 'PayNow',
      grabpay: 'GrabPay',
      shopeepay: 'ShopeePay',
      atome: 'Atome',
      apple_pay: 'Apple Pay',
      google_pay: 'Google Pay',
      cash: 'Cash',
    };
    return methodMap[method] || method;
  };

  // Helper function to render payment status badge
  const renderPaymentStatusBadge = (status: PaymentStatus | undefined) => {
    if (!status) return null;

    const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
      pending: { label: 'Payment Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      completed: { label: 'Payment Successful', className: 'bg-green-100 text-green-800 border-green-300' },
      failed: { label: 'Payment Failed', className: 'bg-red-100 text-red-800 border-red-300' },
      refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-800 border-gray-300' },
      partially_refunded: { label: 'Partially Refunded', className: 'bg-gray-100 text-gray-800 border-gray-300' },
    };

    const config = statusConfig[status];

    // Handle unexpected payment status
    if (!config) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-gray-100 text-gray-800 border-gray-300">
          {status}
        </span>
      );
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  useEffect(() => {
    // Wait for auth initialization before checking authentication
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?redirect=/orders/${orderId}`);
      return;
    }

    loadOrder();
    fetchAllSettings(); // Fetch settings on mount
    const interval = setInterval(loadOrder, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [orderId, isAuthenticated, isInitialized, router, fetchAllSettings]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const orderData = await orderService.getOrder(orderId);
      setOrder(orderData);

      // Load delivery info if order has delivery
      if (orderData.fulfillmentType === 'delivery') {
        try {
          const deliveryData = await deliveryService.getDeliveryByOrder(orderId);
          setDelivery(deliveryData);
        } catch (err) {
          console.log('No delivery tracking available yet');
        }
      }

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
      setIsLoading(false);
    }
  };

  // Show loading while auth is initializing or order is loading
  if (!isInitialized || (isLoading && !order)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Order not found</h2>
          <p className="text-text-secondary mb-6">{error || 'This order does not exist'}</p>
          <Link href="/orders">
            <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all">
              View My Orders
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const isDelivered = order.status === 'delivered' || order.status === 'picked_up';
  const isCancelled = order.status === 'cancelled';
  const needsPayment =
    (order.paymentStatus === 'pending' || order.paymentStatus === 'failed') &&
    order.paymentMethod !== 'cash' &&
    !isCancelled;

  const handleRepay = async () => {
    setIsRepaying(true);
    setRepayError(null);
    try {
      const redirectUrl = `${window.location.origin}/payment/success?orderId=${order.id}`;
      const paymentResponse = await paymentService.initiatePayment({
        orderId: order.id,
        redirectUrl,
        returnUrl: redirectUrl,
      });

      let paymentUrl: string | null =
        paymentResponse.payment?.paymentUrl || paymentResponse.paymentUrl || null;

      if (!paymentUrl && paymentResponse.payment) {
        const dataString = paymentResponse.payment.webhookData || (paymentResponse.payment as any).gatewayResponse;
        if (dataString) {
          const urlMatch = dataString.match(/url=(https:\/\/[^\s,}]+)/);
          if (urlMatch?.[1]) paymentUrl = urlMatch[1];
        }
      }

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        setRepayError('Unable to initiate payment. Please try again or contact support.');
      }
    } catch (err) {
      setRepayError(err instanceof Error ? err.message : 'Payment initiation failed.');
    } finally {
      setIsRepaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-gray py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-4 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">All Orders</span>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-text-secondary">
                  {new Date(order.createdAt).toLocaleDateString('en-SG', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <OrderStatus status={order.status} />
            </div>
          </div>

          {/* Payment Status Banner - Show if returning from payment or has payment error */}
          {(isPaymentReturn || hasPaymentError) && (
            <div className="mb-6">
              {hasPaymentError ? (
                <Alert variant="destructive">
                  <AlertTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment Failed
                  </AlertTitle>
                  <AlertDescription>
                    Your order was created but payment initiation failed. Please contact support for assistance.
                  </AlertDescription>
                </Alert>
              ) : order.paymentStatus === 'completed' || order.payment?.status === 'completed' || (paymentStatus === 'success' && !order.paymentStatus && !order.payment?.status) ? (
                <Alert className="border-green-300 bg-green-50">
                  <AlertTitle className="flex items-center gap-2 text-green-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment Successful!
                  </AlertTitle>
                  <AlertDescription className="text-green-700">
                    Your payment has been processed successfully. Thank you for your order!
                  </AlertDescription>
                </Alert>
              ) : order.paymentStatus === 'failed' || order.payment?.status === 'failed' || (paymentStatus === 'failed' && !order.paymentStatus && !order.payment?.status) ? (
                <Alert variant="destructive">
                  <AlertTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Payment Failed
                  </AlertTitle>
                  <AlertDescription>
                    Your payment was not successful. Please try again or contact support.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-yellow-300 bg-yellow-50">
                  <AlertTitle className="flex items-center gap-2 text-yellow-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment Pending
                  </AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Your payment is being processed. This page will automatically update when the payment is confirmed (usually within 30 seconds).
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Payment Required Banner - shown persistently when payment is still needed */}
          {needsPayment && !isPaymentReturn && (
            <div className="mb-6">
              <Alert className="border-yellow-300 bg-yellow-50">
                <AlertTitle className="flex items-center gap-2 text-yellow-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Payment Required
                </AlertTitle>
                <AlertDescription className="text-yellow-700">
                  {order.paymentStatus === 'failed'
                    ? 'Your previous payment was unsuccessful.'
                    : 'This order is awaiting payment.'}{' '}
                  Complete payment to confirm your order.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Order Status Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-text-primary mb-6">Order Status</h2>
            <OrderStatus status={order.status} vertical fulfillmentType={order.fulfillmentType} />
          </div>

          {/* Delivery Tracking */}
          {order.fulfillmentType === 'delivery' && delivery && !isCancelled && (
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl shadow-xl p-8 mb-6">
              <h2 className="text-2xl font-bold mb-4">Delivery Tracking</h2>

              {delivery.estimatedDeliveryTime && (
                <div className="text-xl mb-6">
                  Estimated Delivery: <span className="font-bold text-secondary">{new Date(delivery.estimatedDeliveryTime).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}

              {delivery.driverName && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center text-2xl">
                      🚗
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{delivery.driverName}</div>
                      {delivery.driverPhone && (
                        <a href={`tel:${delivery.driverPhone}`} className="text-sm text-secondary hover:underline">
                          {delivery.driverPhone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-white/80">
                Provider: <span className="font-semibold capitalize">{delivery.provider.replace('_', ' ')}</span>
              </div>
            </div>
          )}

          {/* Cancelled Message */}
          {isCancelled && (
            <div className="bg-error/10 border-2 border-error rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-error rounded-full flex items-center justify-center text-2xl">
                  ❌
                </div>
                <div>
                  <h3 className="text-xl font-bold text-error">Order Cancelled</h3>
                  {order.cancellationReason && (
                    <p className="text-text-secondary text-sm mt-1">
                      Reason: {order.cancellationReason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-text-primary mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => {
                // Handle both old format (with menuItem object) and new format (with direct fields)
                const itemName = item.itemName || item.menuItem?.name || 'Item';
                const itemImageUrl = item.imageUrl || item.menuItem?.imageUrl;

                return (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-border-light last:border-0 last:pb-0">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center flex-shrink-0">
                      {itemImageUrl ? (
                        <img
                          src={itemImageUrl}
                          alt={itemName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-3xl">🍛</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary">
                        {item.quantity}x {itemName}
                      </div>
                      <div className="text-sm text-text-tertiary">
                        S$ {item.unitPrice.toFixed(2)} each
                      </div>
                    </div>
                    <div className="font-bold text-primary">
                      S$ {item.subtotal.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          <div className="mb-6">
            {/* Order Type */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-text-primary mb-3">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Type:</span>
                  <span className="font-semibold text-text-primary">
                    {order.instantOrder || order.orderType === 'instant' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        Instant Order
                      </span>
                    ) : order.cateringOrder || order.orderType === 'catering' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary rounded-md">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        Catering Order
                      </span>
                    ) : order.orderType === 'scheduled' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Scheduled Order
                      </span>
                    ) : (
                      <span className="capitalize">{order.orderType}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Fulfillment:</span>
                  <span className="font-semibold text-text-primary capitalize">{order.fulfillmentType}</span>
                </div>
                {order.fulfillmentType === 'delivery' && (
                  <div className="flex justify-between items-start">
                    <span className="text-text-secondary">Delivery Address:</span>
                    <span className="font-semibold text-text-primary text-right max-w-[60%]">
                      {order.deliveryAddress ? (
                        <>
                          {order.deliveryAddress.floorUnit && `${order.deliveryAddress.floorUnit}, `}
                          {order.deliveryAddress.buildingName && `${order.deliveryAddress.buildingName}, `}
                          {order.deliveryAddress.streetAddress}, Singapore {order.deliveryAddress.postalCode}
                        </>
                      ) : (
                        <span className="text-text-tertiary font-normal">Not available</span>
                      )}
                    </span>
                  </div>
                )}
                {order.contactName && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Contact:</span>
                    <span className="font-semibold text-text-primary">{order.contactName}</span>
                  </div>
                )}
                {order.contactPhone && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Phone:</span>
                    <a href={`tel:${order.contactPhone}`} className="font-semibold text-primary hover:underline">{order.contactPhone}</a>
                  </div>
                )}
                {order.estimatedPreparationTime && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Prep Time:</span>
                    <span className="font-semibold text-text-primary">{order.estimatedPreparationTime} min</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-text-primary mb-4">Payment Summary</h3>

            {/* Payment Status and Method */}
            {(order.paymentStatus || order.payment?.status || order.paymentMethod || order.payment?.paymentMethod) && (
              <div className="mb-6 pb-6 border-b border-border-light space-y-3">
                {(order.paymentStatus || order.payment?.status) && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Payment Status</span>
                    <div>{renderPaymentStatusBadge(order.paymentStatus || order.payment?.status)}</div>
                  </div>
                )}
                {needsPayment && (
                  <div className="pt-2">
                    {repayError && (
                      <p className="text-sm text-red-600 mb-3">{repayError}</p>
                    )}
                    <button
                      onClick={handleRepay}
                      disabled={isRepaying}
                      className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isRepaying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Redirecting to Payment...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Pay Now — S$ {order.total.toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
                )}
                {(order.paymentMethod || order.payment?.paymentMethod) && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Payment Method</span>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="font-semibold text-text-primary">
                        {formatPaymentMethod(order.paymentMethod || order.payment?.paymentMethod)}
                      </span>
                    </div>
                  </div>
                )}
                {(order.payment?.hitpayReferenceId) && (
                  <div className="flex justify-between items-start">
                    <span className="text-text-secondary text-sm">Reference ID</span>
                    <span className="font-mono text-xs text-text-tertiary text-right break-all max-w-[200px]">
                      {order.payment.hitpayReferenceId}
                    </span>
                  </div>
                )}
              </div> 
            )}

            {/* Price Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span className="font-semibold">S$ {order.subtotal.toFixed(2)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-text-secondary">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">S$ {order.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              {order.platformFee > 0 && (
                <div className="flex justify-between text-text-secondary">
                  <span>Platform Fee</span>
                  <span className="font-semibold">S$ {order.platformFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-text-secondary">
                <span>GST {isGSTEnabled() ? `(${getGSTRate()}%)` : ''}</span>
                <span className="font-semibold">
                  S$ {isGSTEnabled() ? order.gstAmount.toFixed(2) : '0.00'}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Promo Discount</span>
                  <span className="font-semibold">- S$ {order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {(order.pointsDiscount ?? 0) > 0 && (
                <div className="flex justify-between text-success">
                  <span>Points Discount</span>
                  <span className="font-semibold">- S$ {(order.pointsDiscount ?? 0).toFixed(2)}</span>
                </div>
              )}
              {order.pointsRedeemed > 0 && order.pointsValue && (
                <div className="flex justify-between text-success">
                  <span>Points Redeemed ({order.pointsRedeemed} pts)</span>
                  <span className="font-semibold">- S$ {order.pointsValue.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-primary border-t-2 border-border-light pt-3 mt-3">
                <span>{needsPayment ? 'Total' : 'Total Paid'}</span>
                <span>S$ {order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Loyalty Points Earned - Only show when order is completed */}
            {(order.status === 'delivered' || order.status === 'picked_up' || order.status === 'completed') &&
              (order.pointsEarned || (order.subtotal > 0 && getPointsPerDollar() > 0)) && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div>
                      <div className="text-sm text-green-700 font-medium">Loyalty Points Earned</div>
                      <div className="text-xs text-green-600">From this order</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-800">
                      +{order.pointsEarned || Math.floor(order.subtotal * getPointsPerDollar())}
                    </div>
                    <div className="text-xs text-green-600">points</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {!isDelivered && !isCancelled && (
            <div className="mt-6 text-center">
              <Link href="/menu">
                <button className="text-primary hover:text-primary-dark font-semibold">
                  Order More Food
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
