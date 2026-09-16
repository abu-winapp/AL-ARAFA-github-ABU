/**
 * Al-Arafa Restaurant - Admin API Service
 */

import axios from 'axios';
// import apiClient, { setAccessToken, setRefreshToken } from './client';
import apiClient from './client';
import { setUser } from './auth.service';
import type {
  Order,
  AuthResponse,
  PaginatedResponse,
  BackendPaginatedResponse
} from '@/types';

/**
 * Normalize backend order response to frontend Order type
 * Handles field mapping and order type conversion
 */
function normalizeBackendOrder(backendOrder: any): Order {
  return {
    ...backendOrder,
    // Map instant -> regular for frontend consistency
    orderType: backendOrder.orderType === 'instant' ? 'regular' : backendOrder.orderType,

    // Create user object from direct fields if not present
    user: backendOrder.user || {
      id: backendOrder.userId,
      fullName: backendOrder.customerName || backendOrder.contactName,
      phone: backendOrder.customerPhone || backendOrder.contactPhone,
      email: backendOrder.contactEmail,
      loyaltyPoints: 0,
      userType: 'customer' as const,
      status: 'active' as const,
      createdAt: backendOrder.createdAt || new Date().toISOString(),
      updatedAt: backendOrder.updatedAt || new Date().toISOString(),
    },

    // Create location object from direct fields if not present
    location: backendOrder.location || (backendOrder.locationId ? {
      id: backendOrder.locationId,
      name: backendOrder.locationName || 'Unknown Location',
      address: '',
      postalCode: '',
      latitude: 0,
      longitude: 0,
      phone: '',
      isActive: true,
      acceptsPickup: true,
      acceptsDelivery: true,
      createdAt: backendOrder.createdAt || new Date().toISOString(),
      updatedAt: backendOrder.updatedAt || new Date().toISOString(),
    } : undefined),

    // Map items to include itemName and imageUrl in menuItem object
    items: backendOrder.items?.map((item: any) => ({
      ...item,
      itemName: item.itemName || item.menuItem?.name,
      imageUrl: item.itemImageUrl || item.menuItem?.imageUrl,
      menuItem: item.menuItem || {
        id: item.menuItemId,
        name: item.itemName,
        imageUrl: item.itemImageUrl,
      },
    })) || [],

    // Ensure all expected fields are present with sensible defaults
    deliveryInstructions: backendOrder.specialInstructions || backendOrder.deliveryInstructions,
    leaveAtDoor: backendOrder.leaveAtDoorstep ?? backendOrder.leaveAtDoor ?? false,
  };
}

/**
 * Transform backend orders pagination to frontend format
 */
function transformOrdersPaginatedResponse(
  backendResponse: BackendPaginatedResponse<any>
): PaginatedResponse<Order> {
  return {
    items: (backendResponse.content || []).map(normalizeBackendOrder),
    page: backendResponse.page || 0,
    pageSize: backendResponse.size || 0,
    totalItems: backendResponse.totalElements || 0,
    totalPages: backendResponse.totalPages || 0,
    hasNext: !backendResponse.last,
    hasPrevious: !backendResponse.first,
  };
}

/**
 * Admin login with email/password
 */
export async function adminLogin(email: string, password: string): Promise<AuthResponse> {
  let response;
  try {
    response = await apiClient.post('/admin/auth/login', { email, password });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      }
      const message = err.response?.data?.message || err.response?.data?.error;
      if (message) throw new Error(message);
    }
    throw err;
  }
  const authData: AuthResponse = response.data.data;

  // Store tokens and user data
  // setAccessToken(authData.accessToken);
  // setRefreshToken(authData.refreshToken);
  setUser(authData.user);

  return authData;
}

/**
 * Get all orders with pagination and filters (admin)
 * @param page - Zero-based page number
 * @param size - Page size (items per page)
 * @param filters - Optional filters: status, orderType
 */
export async function getAllOrders(
  page: number = 0,
  size: number = 20,
  filters?: {
    status?: string;
    orderType?: 'regular' | 'catering';
  }
): Promise<PaginatedResponse<Order>> {
  const params: any = { page, size };

  if (filters?.status) {
    params.status = filters.status;
  }

  if (filters?.orderType) {
    // Map frontend 'regular' back to backend 'instant'
    params.orderType = filters.orderType === 'regular' ? 'instant' : filters.orderType;
  }

  try {
    const response = await apiClient.get('/admin/orders', { params });

    // IMPORTANT: Orders endpoint returns pagination directly (no data wrapper)
    const backendData = response.data;

    // Validate response structure
    if (!backendData || backendData.content === undefined) {
      console.error('Unexpected orders response structure:', backendData);
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

    return transformOrdersPaginatedResponse(backendData);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
}

/**
 * Get active orders (admin)
 */
export async function getActiveOrders(): Promise<Order[]> {
  const response = await apiClient.get('/admin/orders/active');
  const orders = response.data.data || response.data || [];
  return orders.map(normalizeBackendOrder);
}

/**
 * Get catering orders (admin)
 */
export async function getCateringOrders(): Promise<Order[]> {
  const response = await apiClient.get('/admin/orders/catering');
  const orders = response.data.data || response.data || [];
  return orders.map(normalizeBackendOrder);
}

/**
 * Get order details (admin)
 */
export async function getAdminOrder(id: string): Promise<Order> {
  const response = await apiClient.get(`/admin/orders/${id}`);
  const order = response.data.data || response.data;
  return normalizeBackendOrder(order);
}

/**
 * Update order status (admin)
 */
export async function updateOrderStatus(
  id: string,
  status: string
): Promise<Order> {
  const response = await apiClient.put(`/admin/orders/${id}/status`, { status });
  const order = response.data.data || response.data;
  return normalizeBackendOrder(order);
}

/**
 * Cancel order (admin)
 */
export async function adminCancelOrder(
  id: string,
  reason: string
): Promise<Order> {
  const response = await apiClient.post(`/admin/orders/${id}/cancel`, { reason });
  const order = response.data.data || response.data;
  return normalizeBackendOrder(order);
}

/**
 * Get dashboard analytics (admin)
 */
export async function getDashboard(): Promise<{
  ordersToday: number;
  revenueToday: number;
  activeOrders: number;
  recentOrders: Order[];
}> {
  const response = await apiClient.get('/admin/orders/dashboard');
  // Dashboard endpoint returns data directly (no .data wrapper)
  const data = response.data;

  // Normalize recentOrders if present
  if (data.recentOrders && Array.isArray(data.recentOrders)) {
    data.recentOrders = data.recentOrders.map(normalizeBackendOrder);
  }

  return data;
}
