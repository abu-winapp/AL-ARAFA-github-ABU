import apiClient from './client';
import type { Location } from '@/types';

/**
 * Request payload for creating a new location
 */
export interface CreateLocationRequest {
  name: string;
  address: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  openingTime: string; // Format: "HH:mm:ss"
  closingTime: string; // Format: "HH:mm:ss"
  isActive: boolean;
  acceptsDelivery: boolean;
  acceptsPickup: boolean;
}

/**
 * Request payload for updating an existing location
 */
export interface UpdateLocationRequest {
  name: string;
  address: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  openingTime: string; // Format: "HH:mm:ss"
  closingTime: string; // Format: "HH:mm:ss"
  isActive: boolean;
  acceptsDelivery: boolean;
  acceptsPickup: boolean;
}

/**
 * Get all locations
 */
export async function getAllLocations(): Promise<Location[]> {
  const response = await apiClient.get<Location[]>('/admin/locations');
  return response.data;
}

/**
 * Get a single location by ID
 */
export async function getLocationById(id: string): Promise<Location> {
  const response = await apiClient.get<Location>(`/admin/locations/${id}`);
  return response.data;
}

/**
 * Create a new location
 */
export async function createLocation(data: CreateLocationRequest): Promise<Location> {
  const response = await apiClient.post<Location>('/admin/locations', data);
  return response.data;
}

/**
 * Update an existing location
 */
export async function updateLocation(id: string, data: UpdateLocationRequest): Promise<Location> {
  const response = await apiClient.put<Location>(`/admin/locations/${id}`, data);
  return response.data;
}

/**
 * Toggle location active status
 */
export async function updateLocationStatus(id: string, isActive: boolean): Promise<void> {
  await apiClient.put(`/admin/locations/${id}/status`, { isActive });
}

/**
 * Update location operating hours
 */
export async function updateOperatingHours(
  id: string,
  openingTime: string,
  closingTime: string
): Promise<void> {
  await apiClient.put(`/admin/locations/${id}/hours`, { openingTime, closingTime });
}

/**
 * Delete a location
 */
export async function deleteLocation(id: string): Promise<void> {
  await apiClient.delete(`/admin/locations/${id}`);
}
