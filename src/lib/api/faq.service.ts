import { apiRequest } from './client';
import apiClient from './client';
import { FAQ } from '@/types';

// Cache configuration
interface CacheEntry {
  data: FAQ[];
  timestamp: number;
}

let faqCache: CacheEntry | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Request deduplication
const pendingRequests = new Map<string, Promise<FAQ[]>>();

/**
 * Retry helper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

/**
 * GET /api/faqs - Fetch all active FAQs
 * @param forceRefresh - Bypass cache and fetch fresh data
 * @returns Array of FAQ items
 */
export async function getFAQs(forceRefresh = false): Promise<FAQ[]> {
  const cacheKey = 'faqs';

  // Check cache first (unless force refresh)
  if (!forceRefresh && faqCache && Date.now() - faqCache.timestamp < CACHE_TTL) {
    return faqCache.data;
  }

  // Check for in-flight request
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  // Create new request with retry logic
  const promise = withRetry(async () => {
    const response = await apiClient.get<FAQ[]>('/faqs');
    return response.data;
  });
  pendingRequests.set(cacheKey, promise);

  try {
    const data = await promise;

    // Update cache
    faqCache = { data, timestamp: Date.now() };

    return data;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

/**
 * GET /api/faqs/:id - Fetch single FAQ by ID
 * @param id - FAQ identifier
 * @returns Single FAQ item
 */
export async function getFAQById(id: string): Promise<FAQ> {
  return withRetry(async () => {
    const response = await apiClient.get<FAQ>(`/faqs/${id}`);
    return response.data;
  });
}

/**
 * GET /api/faqs/categories - Fetch all FAQ categories
 * @returns Array of category names
 */
export async function getFAQCategories(): Promise<string[]> {
  return withRetry(async () => {
    const response = await apiClient.get<string[]>('/faqs/categories');
    return response.data;
  });
}

/**
 * GET /api/faqs?category={category} - Fetch FAQs by category
 * @param category - Category name to filter by
 * @returns Array of FAQ items in the specified category
 */
export async function getFAQsByCategory(category: string): Promise<FAQ[]> {
  const cacheKey = `faqs-${category}`;

  // Check for in-flight request
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  // Create new request with retry logic
  const promise = withRetry(async () => {
    const response = await apiClient.get<FAQ[]>(`/faqs?category=${encodeURIComponent(category)}`);
    return response.data;
  });
  pendingRequests.set(cacheKey, promise);

  try {
    return await promise;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

/**
 * Invalidate FAQ cache
 * Call this after creating/updating/deleting FAQs
 */
export function invalidateFAQCache(): void {
  faqCache = null;
}

// Admin Endpoints

/**
 * POST /api/admin/faqs - Create new FAQ
 * @param data - FAQ data without ID
 * @returns Created FAQ with ID
 */
export async function createFAQ(data: Omit<FAQ, 'id'>): Promise<FAQ> {
  const result = await apiRequest<FAQ>('POST', '/admin/faqs', data);
  invalidateFAQCache();
  return result;
}

/**
 * PUT /api/admin/faqs/:id - Update existing FAQ
 * @param id - FAQ identifier
 * @param data - Partial FAQ data to update
 * @returns Updated FAQ
 */
export async function updateFAQ(id: string, data: Partial<FAQ>): Promise<FAQ> {
  const result = await apiRequest<FAQ>('PUT', `/admin/faqs/${id}`, data);
  invalidateFAQCache();
  return result;
}

/**
 * DELETE /api/admin/faqs/:id - Delete FAQ
 * @param id - FAQ identifier
 */
export async function deleteFAQ(id: string): Promise<void> {
  await apiRequest<void>('DELETE', `/admin/faqs/${id}`);
  invalidateFAQCache();
}
