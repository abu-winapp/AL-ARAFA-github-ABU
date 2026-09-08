/**
 * Al-Arafa Restaurant - Geocoding API Service
 */

import { apiRequest } from './client';
import type { GeocodingData } from '@/types';

/**
 * Geocode a Singapore postal code to get address details
 * Note: apiRequest automatically unwraps the response.data, so we get GeocodingData directly
 */
export async function geocodePostalCode(postalCode: string): Promise<GeocodingData> {
  return apiRequest<GeocodingData>('GET', `/geocoding/postal/${postalCode}`);
}
