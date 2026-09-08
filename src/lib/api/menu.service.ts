/**
 * Al-Arafa Restaurant - Menu API Service
 */

import { apiRequest } from './client';
import type { MenuItem, Category } from '@/types';

/**
 * Get all active menu categories
 * @param menuType - Optional filter by menu type (regular or catering)
 */
export async function getCategories(menuType?: 'regular' | 'catering'): Promise<Category[]> {
  const params = menuType ? { menuType } : {};
  return apiRequest<Category[]>('GET', '/menu/categories', undefined, { params });
}

/**
 * Get categories with item counts
 */
export async function getCategoriesWithItems(): Promise<Category[]> {
  return apiRequest<Category[]>('GET', '/menu/categories/with-items');
}

/**
 * Get all available menu items
 * @param params - Optional filters for menu items
 */
export async function getMenuItems(params?: {
  locationId?: string;
  menuType?: 'regular' | 'catering';
}): Promise<MenuItem[]> {
  const items = await apiRequest<any[]>('GET', '/menu/items', undefined, { params: params || {} });

  // Transform API response to match MenuItem type (map isAvailable to available)
  return items.map(item => ({
    ...item,
    available: item.available ?? item.isAvailable ?? true,
  })) as MenuItem[];
}

/**
 * Get menu items by category
 */
export async function getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
  const items = await apiRequest<any[]>('GET', `/menu/items/category/${categoryId}`);
  // Transform API response to match MenuItem type (map isAvailable to available)
  return items.map(item => ({
    ...item,
    available: item.available ?? item.isAvailable ?? true,
  })) as MenuItem[];
}

/**
 * Get menu item details
 */
export async function getMenuItem(id: string): Promise<MenuItem> {
  const item = await apiRequest<any>('GET', `/menu/items/${id}`);
  // Transform API response to match MenuItem type (map isAvailable to available)
  return {
    ...item,
    available: item.available ?? item.isAvailable ?? true,
  } as MenuItem;
}

/**
 * Search menu items
 */
export async function searchMenuItems(query: string): Promise<MenuItem[]> {
  const items = await apiRequest<any[]>('GET', '/menu/search', undefined, {
    params: { query },
  });
  // Transform API response to match MenuItem type (map isAvailable to available)
  return items.map(item => ({
    ...item,
    available: item.available ?? item.isAvailable ?? true,
  })) as MenuItem[];
}

/**
 * Get full menu structure (categories with items)
 */
export async function getFullMenu(): Promise<{
  categories: Category[];
  items: MenuItem[];
}> {
  return apiRequest('GET', '/menu/full');
}
