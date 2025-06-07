import { apiClient } from './client';
import { 
  UpdateProfilePayload, 
  AdminUpdatePayload, 
  CreateProfilePayload, 
  AddLootboxToProfilePayload, 
  UpdateProfileItemPayload 
} from './types';

export const profileApi = {
  // Get profile data
  get: (signal?: AbortSignal) => {
    return apiClient.get('/profile/get', undefined, signal);
  },

  // Update profile
  update: (data: UpdateProfilePayload, signal?: AbortSignal) => {
    return apiClient.put('/profile/update', data, signal);
  },

  // Admin update profile
  adminUpdate: (data: AdminUpdatePayload, signal?: AbortSignal) => {
    return apiClient.put('/profile/admin-update', data, signal);
  },

  // Create profile
  create: (data: CreateProfilePayload, signal?: AbortSignal) => {
    return apiClient.post('/profile/create', data, signal);
  },

  // Add lootbox to profile
  addLootbox: (data: AddLootboxToProfilePayload, signal?: AbortSignal) => {
    return apiClient.post('/profile/add-lootbox', data, signal);
  },

  // Get profile item by ID
  getItem: (itemId: string, signal?: AbortSignal) => {
    return apiClient.get(`/profile/${itemId}`, undefined, signal);
  },

  // Update profile item
  updateItem: (itemId: string, data: UpdateProfileItemPayload, signal?: AbortSignal) => {
    return apiClient.put(`/profile/${itemId}`, data, signal);
  },

  // Delete profile item
  deleteItem: (itemId: string, signal?: AbortSignal) => {
    return apiClient.delete(`/profile/${itemId}`, signal);
  }
};