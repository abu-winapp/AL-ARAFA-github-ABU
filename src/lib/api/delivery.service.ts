/**
 * Al-Arafa Restaurant - Delivery API Service
 */

import { apiRequest } from './client';
import type { GetDeliveryQuotesRequest, DeliveryQuotesResponse, DeliveryBooking } from '@/types';

/**
 * Get delivery quotes from 3rd party providers
 */
export async function getDeliveryQuotes(
  request: GetDeliveryQuotesRequest
): Promise<DeliveryQuotesResponse> {
  return apiRequest<DeliveryQuotesResponse>('POST', '/delivery/quotes', request);
}

/**
 * Get delivery booking by order ID
 */
export async function getDeliveryByOrder(orderId: string): Promise<DeliveryBooking> {
  return apiRequest<DeliveryBooking>('GET', `/delivery/orders/${orderId}`);
}
