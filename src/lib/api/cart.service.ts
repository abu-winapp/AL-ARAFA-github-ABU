/**
 * Al-Arafa Restaurant - Cart API Service
 */

import { apiRequest } from './client';
import type { Cart, AddToCartRequest, UpdateCartItemRequest, AddToCartResponse } from '@/types';

/**
 * Get current user's cart
 */
export async function getCart(): Promise<Cart> {
  return apiRequest<Cart>('GET', '/cart');
}

/**
 * Add item to cart
 */
export async function addToCart(request: AddToCartRequest): Promise<AddToCartResponse> {
  return apiRequest<AddToCartResponse>('POST', '/cart/items', request);
}

/**
 * Update cart item
 */
export async function updateCartItem(
  itemId: string,
  request: UpdateCartItemRequest
): Promise<Cart> {
  return apiRequest<Cart>('PUT', `/cart/items/update/${itemId}`, request);
}

/**
 * Remove item from cart
 */
export async function removeCartItem(itemId: string): Promise<Cart> {
  return apiRequest<Cart>('DELETE', `/cart/items/delete/${itemId}`);
}

/**
 * Update cart location
 * Note: fulfillmentType is managed frontend-only in Zustand store, not sent to backend
 */
export async function updateCartLocation(locationId: string): Promise<Cart> {
  return apiRequest<Cart>('PUT', '/cart/location', { locationId });
  // return apiRequest<Cart>('PUT', 'api/locations/active', { locationId });
}

/**
 * Clear entire cart
 */
export async function clearCart(): Promise<void> {
  return apiRequest<void>('DELETE', '/cart_delete');
}

/**
 * Get cart item count
 */
export async function getCartCount(): Promise<number> {
  return apiRequest<number>('GET', '/cart/count');
}
