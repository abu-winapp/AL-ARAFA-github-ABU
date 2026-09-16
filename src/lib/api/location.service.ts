/**
 * Al-Arafa Restaurant - Location API Service
 */

import { apiRequest } from './client';
import type { Location } from '@/types';

/**
 * Get all locations
 */
export async function getAllLocations(): Promise<Location[]> {
  return apiRequest<Location[]>('GET', '/locations');
}

/**
 * Get active locations only
 */
export async function getActiveLocations(): Promise<Location[]> {
  return apiRequest<Location[]>('GET', '/locations/active');
}

/**
 * Get location by ID
 */
export async function getLocation(id: string): Promise<Location> {
  return apiRequest<Location>('GET', `/locations/by_location/${id}`);
}
