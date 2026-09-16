/**
 * Al-Arafa Restaurant - Order API Service
 */

import { apiRequest } from './client';
import type { Order, CreateOrderRequest, PaginatedResponse, PaginationParams, BackendOrdersResponse, PartyHallRequest, PartyHallBookingResponse } from '@/types';

/**
 * Create new order
 */
// export async function createOrder(request: CreateOrderRequest): Promise<Order> {
//   console.log('[Orders] Sending payload to /orders API:', request);
//   return apiRequest<Order>('POST', '/orders', request);
// }

export async function createOrder(
  request: CreateOrderRequest
): Promise<Order> {
  console.log('[Orders] Sending payload to /orders API:', request);

  return apiRequest<Order>('POST', '/orders', request);
}
/**
 * Get user's orders (paginated)
 * Transforms backend Spring Boot pagination format to frontend format
 */
export async function getMyOrders(params?: PaginationParams): Promise<PaginatedResponse<Order>> {
  const queryParams: Record<string, string> = {
    page: String(params?.page ?? 0),
    size: String(params?.pageSize ?? 10),
  };

  if (params?.sortBy) {
    queryParams.sortBy = params.sortBy;
  }

  if (params?.sortOrder) {
    queryParams.sortOrder = params.sortOrder;
  }

  const backendResponse = await apiRequest<BackendOrdersResponse>('GET', '/orders/my', undefined, {
    params: queryParams
  });

  // Transform backend pagination to frontend format
  return {
    items: backendResponse.content,
    page: backendResponse.page,
    pageSize: backendResponse.size,
    totalItems: backendResponse.totalElements,
    totalPages: backendResponse.totalPages,
    hasNext: !backendResponse.last,
    hasPrevious: !backendResponse.first,
  };
}

/**
 * Get order by ID
 */
export async function getOrder(id: string): Promise<Order> {
  return apiRequest<Order>('GET', `/orders/${id}`);
}

/**
 * Track order by order number
 */
export async function trackOrder(orderNumber: string): Promise<Order> {
  return apiRequest<Order>('GET', `/orders/track/${orderNumber}`);
}

/**
 * Cancel order
 */
export async function cancelOrder(id: string): Promise<Order> {
  return apiRequest<Order>('POST', `/orders/${id}/cancel`);
}


export async function savePartyHallBooking(
  request: PartyHallRequest
): Promise<PartyHallBookingResponse> {
  console.log('[Orders] Sending payload to /orders API:', request);

  return apiRequest<PartyHallBookingResponse>('POST', '/order/party_hall', request);
}