/**
 * Al-Arafa Restaurant - Admin Customers API Service
 */

import apiClient from './client';
import type { User, Order, PaginatedResponse, BackendPaginatedResponse, BackendOrdersResponse } from '@/types';

/**
 * Normalize user data from backend format to frontend format
 */

function normalizeUser(user: any): User {
  return {
    ...user,
    fullName: user.name || user.fullName,
    loyaltyPoints: user.pointsBalance ?? user.loyaltyPoints ?? 0,
  };
}

/**
 * Transform backend pagination response to frontend format
 */
function transformPaginatedResponse<T>(
  backendResponse: BackendPaginatedResponse<any>,
  normalizer: (item: any) => T
): PaginatedResponse<T> {
  // Handle case where content might be undefined
  const items = backendResponse.content || [];

  return {
    items: items.map(normalizer),
    page: backendResponse.page || 0,
    pageSize: backendResponse.size || 0,
    totalItems: backendResponse.totalElements || 0,
    totalPages: backendResponse.totalPages || 0,
    hasNext: !backendResponse.last,
    hasPrevious: !backendResponse.first,
  };
}

/**
 * Get all customers with pagination (admin)
 */
export async function getAllCustomers(
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponse<User>> {
  const response = await apiClient.get('/admin/users/customers', {
    params: { page, size }
  });

  // Handle different response wrapper formats
  let backendData: BackendPaginatedResponse<any>;

  if (response.data && response.data.data) {
    // If wrapped in a data property
    backendData = response.data.data;
  } else if (response.data && response.data.content !== undefined) {
    // If directly the pagination object
    backendData = response.data;
  } else {
    // Fallback: empty response
    console.error('Unexpected response structure:', {
      fullResponse: response,
      data: response.data,
      dataType: typeof response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
    });
    return {
      items: [],
      page: 0,
      pageSize: size,
      totalItems: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };
  }

  return transformPaginatedResponse(backendData, normalizeUser);
}

/**
 * Search customers with pagination (admin)
 */
export async function searchCustomers(
  query: string,
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponse<User>> {
  const response = await apiClient.get('/admin/users', {
    params: { search: query, page, size }
  });

  // Handle different response wrapper formats
  let backendData: BackendPaginatedResponse<any>;

  if (response.data.data) {
    backendData = response.data.data;
  } else if (response.data.content) {
    backendData = response.data;
  } else {
    console.error('Unexpected response structure:', response.data);
    return {
      items: [],
      page: 0,
      pageSize: size,
      totalItems: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };
  }

  return transformPaginatedResponse(backendData, normalizeUser);
}

/**
 * Get customer details (admin)
 */
export async function getCustomer(id: string): Promise<User> {
  const response = await apiClient.get(`/admin/users/${id}`);
  // Handle different response wrapper formats
  const userData = response.data.data || response.data;
  return normalizeUser(userData);
}

/**
 * Update customer (admin)
 */
export async function updateCustomer(id: string, data: Partial<User>): Promise<User> {
  const response = await apiClient.put(`/admin/users/${id}`, data);
  const userData = response.data.data || response.data;
  return normalizeUser(userData);
}

/**
 * Update customer status (admin)
 */
export async function updateCustomerStatus(
  id: string,
  isActive: boolean
): Promise<User> {
  const response = await apiClient.put(`/admin/users/${id}/status`, {
    isActive
  });
  const userData = response.data.data || response.data;
  return normalizeUser(userData);
}

/**
 * Toggle customer status (admin) - Legacy method
 * @deprecated Use updateCustomerStatus instead
 */
export async function toggleCustomerStatus(id: string): Promise<User> {
  const response = await apiClient.put(`/admin/users/${id}/status`);
  const userData = response.data.data || response.data;
  return normalizeUser(userData);
}

/**
 * Adjust loyalty points (admin)
 */
export async function adjustLoyaltyPoints(
  id: string,
  points: number,
  description: string
): Promise<User> {
  const response = await apiClient.put(`/admin/users/${id}/points`, {
    points,
    description,
  });
  const userData = response.data.data || response.data;
  return normalizeUser(userData);
}

/**
 * Get customer's orders with pagination (admin)
 */
export async function getCustomerOrders(
  id: string,
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<Order>> {
  const response = await apiClient.get(`/admin/users/${id}/orders`, {
    params: { page, size }
  });

  // Handle different response wrapper formats
  // Backend uses Spring Boot pagination structure: { content: [], page, size, totalElements, totalPages, last, first }
  let ordersData: BackendOrdersResponse | BackendPaginatedResponse<Order>;

  if (response.data.data) {
    ordersData = response.data.data;
  } else if (response.data.content !== undefined) {
    // Standard Spring Boot pagination format
    ordersData = response.data as BackendOrdersResponse;
  } else {
    console.error('Unexpected orders response structure:', response.data);
    return {
      items: [],
      page: 0,
      pageSize: size,
      totalItems: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };
  }

  // Transform Spring Boot pagination to frontend format
  return {
    items: ordersData.content,
    page: ordersData.page,
    pageSize: ordersData.size,
    totalItems: ordersData.totalElements,
    totalPages: ordersData.totalPages,
    hasNext: !ordersData.last,
    hasPrevious: !ordersData.first,
  };
}

/**
 * Delete customer (admin)
 */
export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}
