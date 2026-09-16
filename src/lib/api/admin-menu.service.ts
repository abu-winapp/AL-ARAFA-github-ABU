/**
 * Al-Arafa Restaurant - Admin Menu Management API Service
 */

import apiClient from './client';
import type { MenuItem, Category, MenuItemSuggestion, CompositeComponent, CompositeComponentsResponse } from '@/types';


// Categories Management


/**
 * Get all categories (admin)
 */
export async function getAllCategories(): Promise<Category[]> {
  const response = await apiClient.get('/admin/menu/categories');
  return response.data; // Direct array, no wrapper
}

/**
 * Create category (admin)
 */
export async function createCategory(data: Partial<Category>): Promise<Category> {
  const response = await apiClient.post('/admin/menu/categories', data);
  return response.data; // Direct object, no wrapper
}

/**
 * Update category (admin)
 */
export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  const response = await apiClient.put(`/admin/menu/categories/${id}`, data);
  return response.data; // Direct object, no wrapper
}

/**
 * Toggle category status (admin)
 */
export async function toggleCategoryStatus(id: string): Promise<Category> {
  const response = await apiClient.put(`/admin/menu/categories/${id}/status`);
  return response.data; // Direct object, no wrapper
}

/**
 * Delete category (admin)
 */
export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/admin/menu/categories/${id}`);
}


// Menu Items Management


/**
 * Get all menu items (admin)
 */
export async function getAllMenuItems(): Promise<MenuItem[]> {
  const response = await apiClient.get('/admin/menu/items');
  return response.data; // Direct array, no wrapper
}

/**
 * Get single menu item by ID (admin)
 */
export async function getMenuItem(id: string): Promise<MenuItem> {
  const response = await apiClient.get(`/admin/menu/items/${id}`);
  return response.data; // Direct object, no wrapper
}

/**
 * Create menu item (admin)
 */
export async function createMenuItem(data: Partial<MenuItem>): Promise<MenuItem> {
  const response = await apiClient.post('/admin/menu/items', data);
  return response.data; // Direct object, no wrapper
}

/**
 * Update menu item (admin)
 */
export async function updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
  const response = await apiClient.put(`/admin/menu/items/${id}`, data);
  return response.data; // Direct object, no wrapper
}

/**
 * Toggle item availability (admin)
 */
export async function toggleItemAvailability(id: string): Promise<MenuItem> {
  const response = await apiClient.put(`/admin/menu/items/${id}/availability`);
  return response.data; // Direct object, no wrapper
}

/**
 * Update item price (admin)
 */
export async function updateItemPrice(id: string, price: number): Promise<MenuItem> {
  const response = await apiClient.put(`/admin/menu/items/${id}/price`, { price });
  return response.data; // Direct object, no wrapper
}

/**
 * Delete menu item (admin)
 */
export async function deleteMenuItem(id: string): Promise<void> {
  await apiClient.delete(`/admin/menu/items/${id}`);
}


// Menu Item Suggestions Management


/**
 * Get all suggestions for a menu item
 */
export async function getMenuItemSuggestions(menuItemId: string): Promise<MenuItemSuggestion[]> {
  const response = await apiClient.get(`/admin/menu-items/${menuItemId}/suggestions`);
  return response.data;
}

/**
 * Add a suggestion to a menu item
 */
export async function addMenuItemSuggestion(
  menuItemId: string,
  suggestedItemId: string,
  sortOrder: number
): Promise<MenuItemSuggestion> {
  const response = await apiClient.post(`/admin/menu-items/${menuItemId}/suggestions`, {
    suggestedItemId,
    sortOrder,
  });
  return response.data;
}

/**
 * Update suggestion order
 */
export async function updateSuggestionOrder(
  menuItemId: string,
  suggestionId: string,
  sortOrder: number
): Promise<MenuItemSuggestion> {
  const response = await apiClient.put(
    `/admin/menu-items/${menuItemId}/suggestions/${suggestionId}/order`,
    { sortOrder }
  );
  return response.data;
}

/**
 * Remove a suggestion from a menu item
 */
export async function removeMenuItemSuggestion(
  menuItemId: string,
  suggestionId: string
): Promise<void> {
  await apiClient.delete(`/admin/menu-items/${menuItemId}/suggestions/${suggestionId}`);
}


// Composite Item Components Management


/**
 * Get components and pricing for a composite item
 */
export async function getCompositeComponents(
  compositeItemId: string
): Promise<CompositeComponentsResponse> {
  const response = await apiClient.get(
    `/admin/menu-items/${compositeItemId}/components`
  );
  return response.data;
}

/**
 * Add a component to a composite item
 */
export async function addCompositeComponent(
  compositeItemId: string,
  data: {
    componentItemId: string;
    quantity: number;
    sortOrder: number;
  }
): Promise<CompositeComponent> {
  const response = await apiClient.post(
    `/admin/menu-items/${compositeItemId}/components`,
    data
  );
  return response.data;
}

/**
 * Update component quantity or sort order
 */
export async function updateCompositeComponent(
  compositeItemId: string,
  componentId: string,
  data: {
    quantity?: number;
    sortOrder?: number;
  }
): Promise<CompositeComponent> {
  const response = await apiClient.put(
    `/admin/menu-items/${compositeItemId}/components/${componentId}`,
    data
  );
  return response.data;
}

/**
 * Remove a component from a composite item
 */
export async function removeCompositeComponent(
  compositeItemId: string,
  componentId: string
): Promise<void> {
  await apiClient.delete(
    `/admin/menu-items/${compositeItemId}/components/${componentId}`
  );
}
