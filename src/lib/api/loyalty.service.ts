/**
 * Al-Arafa Restaurant - Loyalty Points API Service
 */

import { apiRequest } from './client';
import type { PointsBalance, PointsHistoryResponse } from '@/types';

/**
 * Get user's points balance
 */
export async function getPointsBalance(): Promise<PointsBalance> {
  return apiRequest<PointsBalance>('GET', '/profile/points');
}

/**
 * Get user's points transaction history (paginated)
 */
export async function getPointsHistory(
  page: number = 0,
  size: number = 10
): Promise<PointsHistoryResponse> {
  return apiRequest<PointsHistoryResponse>(
    'GET',
    '/profile/points/history',
    undefined,
    { params: { page: String(page), size: String(size) } }
  );
}
