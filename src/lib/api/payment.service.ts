/**
 * Al-Arafa Restaurant - Payment API Service
 */

import { apiRequest } from './client';
import type { PaymentMethodOption, InitiatePaymentRequest, InitiatePaymentResponse } from '@/types';

/**
 * Get available payment methods
 */
export async function getPaymentMethods(): Promise<PaymentMethodOption[]> {
  return apiRequest<PaymentMethodOption[]>('GET', '/payments/methods');
}

/**
 * Initiate payment for order
 * Sends both camelCase and snake_case fields for maximum backend compatibility.
 */
export async function initiatePayment(
  request: InitiatePaymentRequest
): Promise<InitiatePaymentResponse> {
  const payload = {
    orderId: request.orderId,
    order_id: request.orderId,
    redirectUrl: request.redirectUrl,
    redirect_url: request.redirectUrl,
    returnUrl: request.returnUrl,
    return_url: request.returnUrl,
    paymentMethod: request.paymentMethod,
    savedCardId: request.savedCardId,
  };

  console.log('[Payment] Calling /payments/initiate with payload:', payload);

  const response = await apiRequest<InitiatePaymentResponse>('POST', '/payments/initiate', payload);

  console.log('[Payment] /payments/initiate response:', response);

  return response;
}

/**
 * Extract the redirect URL from any known response shape.
 * The backend may return the URL under different field names.
 */
export function extractPaymentUrl(response: InitiatePaymentResponse | any): string | null {
  if (!response) return null;

  // Direct top-level fields
  const directFields = [
    'paymentUrl', 'payment_url', 'url', 'redirectUrl', 'redirect_url',
    'checkoutUrl', 'checkout_url', 'hitpayUrl', 'hitpay_url',
    'paymentLink', 'payment_link', 'link',
  ];

  for (const field of directFields) {
    const val = response[field];
    if (typeof val === 'string' && val.startsWith('http')) return val;
  }

  // Nested under .payment object
  if (response.payment && typeof response.payment === 'object') {
    for (const field of directFields) {
      const val = response.payment[field];
      if (typeof val === 'string' && val.startsWith('http')) return val;
    }

    // Try parsing JSON strings inside .payment
    const jsonFields = ['webhookData', 'webhook_data', 'gatewayResponse', 'gateway_response'];
    for (const field of jsonFields) {
      const raw = response.payment[field];
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          const extracted = extractPaymentUrl(parsed);
          if (extracted) return extracted;
        } catch {
          // Try regex as last resort
          const match = raw.match(/(https?:\/\/[^\s"',}]+)/);
          if (match) return match[1];
        }
      }
    }
  }

  // Fallback: regex scan entire JSON string
  try {
    const json = JSON.stringify(response);
    const match = json.match(/(https?:\/\/[^\s"',}\\]+hitpay[^\s"',}\\]*)/i)
      || json.match(/(https?:\/\/[^\s"',}\\]+checkout[^\s"',}\\]*)/i)
      || json.match(/(https?:\/\/[^\s"',}\\]+payment[^\s"',}\\]*)/i);
    if (match) return match[1];
  } catch {
    // ignore
  }

  return null;
}
