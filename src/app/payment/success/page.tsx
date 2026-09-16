/**
 * Al-Arafa Restaurant - Payment Success/Callback Page
 * Handles redirect from HitPay after payment completion
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';

// Force dynamic rendering since we use search params
export const dynamic = 'force-dynamic';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');

  // Initialize auth store on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    // Wait for auth initialization before proceeding
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Get order ID from query params
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      console.error('No orderId in payment callback');
      router.push('/orders');
      return;
    }

    // HitPay sends these parameters on redirect
    const hitpayStatus = searchParams.get('status');
    const reference = searchParams.get('reference');
    const paymentId = searchParams.get('payment_id');

    console.log('Payment callback received:', {
      orderId,
      hitpayStatus,
      reference,
      paymentId,
    });

    // Determine payment status
    // HitPay statuses: completed, failed, pending, cancelled
    if (hitpayStatus === 'completed') {
      setStatus('success');
      // Wait a moment to show success message, then redirect
      setTimeout(() => {
        router.push(`/orders/${orderId}?payment=return&payment_status=success`);
      }, 2000);
    } else if (hitpayStatus === 'failed' || hitpayStatus === 'cancelled') {
      setStatus('failed');
      setTimeout(() => {
        router.push(`/orders/${orderId}?payment=return&payment_status=failed`);
      }, 2000);
    } else {
      // Pending or unknown status - redirect with pending status
      setTimeout(() => {
        router.push(`/orders/${orderId}?payment=return&payment_status=pending`);
      }, 2000);
    }
  }, [isAuthenticated, isInitialized, searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-gray">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Processing Payment</h2>
            <p className="text-text-secondary">Please wait while we confirm your payment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-text-secondary">Redirecting to your order...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-text-secondary">Redirecting to your order...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background-gray">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Loading...</h2>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
