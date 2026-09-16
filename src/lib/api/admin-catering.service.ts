/**
 * Al-Arafa Restaurant - Admin Catering Package Configuration API Service
 */

import apiClient from './client';
import type {
  CateringOptionGroup,
  CateringOptionGroupWithItems,
  CateringOptionItem,
  CreateOptionGroupRequest,
  UpdateOptionGroupRequest,
  AddOptionItemRequest,
  UpdateOptionItemRequest,
} from '@/types';


// Option Groups Management


/**
 * Get all option groups for a catering package
 */
export async function getOptionGroups(
  packageId: string
): Promise<CateringOptionGroupWithItems[]> {
  const response = await apiClient.get(
    `/admin/catering-packages/${packageId}/option-groups`
  );
  return response.data;
}

/**
 * Create a new option group
 */
export async function createOptionGroup(
  packageId: string,
  data: CreateOptionGroupRequest
): Promise<CateringOptionGroup> {
  const response = await apiClient.post(
    `/admin/catering-packages/${packageId}/option-groups`,
    data
  );
  return response.data;
}

/**
 * Update an option group
 */
export async function updateOptionGroup(
  packageId: string,
  groupId: string,
  data: UpdateOptionGroupRequest
): Promise<CateringOptionGroup> {
  const response = await apiClient.put(
    `/admin/catering-packages/${packageId}/option-groups/${groupId}`,
    data
  );
  return response.data;
}

/**
 * Delete an option group
 */
export async function deleteOptionGroup(
  packageId: string,
  groupId: string
): Promise<void> {
  await apiClient.delete(
    `/admin/catering-packages/${packageId}/option-groups/${groupId}`
  );
}


// Option Items Management


/**
 * Add an item to an option group
 */
export async function addOptionItem(
  packageId: string,
  groupId: string,
  data: AddOptionItemRequest
): Promise<CateringOptionItem> {
  const response = await apiClient.post(
    `/admin/catering-packages/${packageId}/option-groups/${groupId}/items`,
    data
  );
  return response.data;
}

/**
 * Update an option item
 */
export async function updateOptionItem(
  packageId: string,
  groupId: string,
  itemId: string,
  data: UpdateOptionItemRequest
): Promise<CateringOptionItem> {
  const response = await apiClient.put(
    `/admin/catering-packages/${packageId}/option-groups/${groupId}/items/${itemId}`,
    data
  );
  return response.data;
}

/**
 * Delete an option item
 */
export async function deleteOptionItem(
  packageId: string,
  groupId: string,
  itemId: string
): Promise<void> {
  await apiClient.delete(
    `/admin/catering-packages/${packageId}/option-groups/${groupId}/items/${itemId}`
  );
}
