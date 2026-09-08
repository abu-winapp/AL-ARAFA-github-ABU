/**
 * Al-Arafa Restaurant - Admin Promo Code API Service
 */

import apiClient from './client';
import type { PromoCode } from '@/types';

/**
 * Get all promo codes (admin)
 */
export async function getAllPromoCodes(): Promise<PromoCode[]> {
  const response = await apiClient.get('/admin/promo');
  return response.data.data;
}

/**
 * Get promo code details (admin)
 */
export async function getPromoCode(id: string): Promise<PromoCode> {
  const response = await apiClient.get(`/admin/promo/${id}`);
  return response.data.data;
}

/**
 * Create promo code (admin)
 */
export async function createPromoCode(data: Partial<PromoCode>): Promise<PromoCode> {
  const response = await apiClient.post('/admin/promo', data);
  return response.data.data;
}

/**
 * Update promo code (admin)
 */
export async function updatePromoCode(id: string, data: Partial<PromoCode>): Promise<PromoCode> {
  const response = await apiClient.put(`/admin/promo/${id}`, data);
  return response.data.data;
}

/**
 * Toggle promo code status (admin)
 */
export async function togglePromoStatus(id: string): Promise<PromoCode> {
  const response = await apiClient.put(`/admin/promo/${id}/status`);
  return response.data.data;
}

/**
 * Delete promo code (admin)
 */
export async function deletePromoCode(id: string): Promise<void> {
  await apiClient.delete(`/admin/promo/${id}`);
}

/**
 * Get promo code usage stats (admin)
 */
export async function getPromoUsage(id: string): Promise<any> {
  const response = await apiClient.get(`/admin/promo/${id}/usage`);
  return response.data.data;
}
