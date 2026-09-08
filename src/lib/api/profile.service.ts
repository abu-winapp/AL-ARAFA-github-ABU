import { apiRequest } from './client';
import type { User } from '@/types';

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  profileImageUrl?: string;
}

export async function getProfile(): Promise<User> {
  return apiRequest<User>('GET', '/profile');
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  return apiRequest<User>('PUT', '/profile', data);
}
