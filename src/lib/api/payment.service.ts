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
 */
export async function initiatePayment(
  request: InitiatePaymentRequest
): Promise<InitiatePaymentResponse> {
  return apiRequest<InitiatePaymentResponse>('POST', '/payments/initiate', request);
}
