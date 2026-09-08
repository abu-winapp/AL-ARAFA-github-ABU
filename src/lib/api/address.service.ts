/**
 * Al-Arafa Restaurant - Address API Service
 */

import { apiRequest } from './client';
import type { UserAddress, SaveAddressRequest } from '@/types';

/**
 * Get user's saved addresses
 */

export async function getAddresses(): Promise<UserAddress[]> {
  return apiRequest<UserAddress[]>('GET', '/profile/addresses');
}

/**
 * Add new address
 */
export async function addAddress(request: SaveAddressRequest): Promise<UserAddress> {
  return apiRequest<UserAddress>('POST', '/profile/addresses', request);
}

/**
 * Update address
 */
export async function updateAddress(
  id: string,
  request: SaveAddressRequest
): Promise<UserAddress> {
  return apiRequest<UserAddress>('PUT', `/profile/addresses/${id}`, request);
}

/**
 * Delete address
 */
export async function deleteAddress(id: string): Promise<void> {
  return apiRequest<void>('DELETE', `/profile/addresses/${id}`);
}

/**
 * Set default address
 */
export async function setDefaultAddress(id: string): Promise<UserAddress> {
  return apiRequest<UserAddress>('PUT', `/profile/addresses/${id}/default`);
}
