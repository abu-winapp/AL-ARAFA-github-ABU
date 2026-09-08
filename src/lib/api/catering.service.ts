/**
 * Al-Arafa Restaurant - Catering Package API Service (Customer-facing)
 */

import { apiRequest } from './client';
import type { CateringOptionGroupWithItems } from '@/types';

/**
 * Get option groups and items for a catering package (customer endpoint)
 *
 * Backend Endpoint: GET /catering/packages/{packageId}/options
 *
 * Returns: Array of option groups with their items
 *
 * Note: This is a public endpoint (no authentication required for viewing)
 * Admin endpoint: GET /admin/catering-packages/{packageId}/option-groups
 * Customer endpoint: GET /catering/packages/{packageId}/options
 */
export async function getPackageOptions(
  packageId: string
): Promise<CateringOptionGroupWithItems[]> {
  return apiRequest<CateringOptionGroupWithItems[]>(
    'GET',
    `/catering/packages/${packageId}/options`
  );
}

/**
 * Save selections for a catering package cart item
 *
 * Backend Endpoint: POST /catering/cart/{cartItemId}/selections
 *
 * Note: This is the dedicated endpoint for catering package selections.
 * Call this AFTER adding the package to cart to save customer selections.
 */
export interface CateringSelection {
  optionGroupId: string;
  selectedItemId: string;
  additionalPrice: number;
}

export interface SaveSelectionsRequest {
  selections: CateringSelection[];
}

export async function saveCartSelections(
  cartItemId: string,
  selections: CateringSelection[]
): Promise<void> {
  return apiRequest<void>(
    'POST',
    `/catering/cart/${cartItemId}/selections`,
    { selections }
  );
}

/**
 * Get saved selections for a catering package cart item
 *
 * Backend Endpoint: GET /catering/cart/{cartItemId}/selections
 *
 * Returns: Array of selections with full details
 */
export interface CateringSelectionWithDetails {
  id: string;
  cartItemId: string;
  optionGroupId: string;
  groupName: string;           // Internal name (e.g., "veg-starters") - NOT the display label
  selectedItemId: string;
  itemName: string;             // Display name of selected item
  additionalPrice: number;
  createdAt: string;
}

export async function getCartSelections(
  cartItemId: string
): Promise<CateringSelectionWithDetails[]> {
  return apiRequest<CateringSelectionWithDetails[]>(
    'GET',
    `/catering/cart/${cartItemId}/selections`
  );
}
