import { apiClient } from './client';
import { CreateSanctionPayload, SanctionFilters } from './types';
import type { ISanction } from '../../types/index.d';

export const sanctionsApi = {
  // Get sanctions list with optional filters
  list: (filters?: SanctionFilters, signal?: AbortSignal) => {
    return apiClient.get<ISanction[]>('/sanctions', filters as Record<string, string | number | boolean>, signal);
  },

  // Create new sanction
  create: (data: CreateSanctionPayload, signal?: AbortSignal) => {
    return apiClient.post<ISanction>('/sanctions', data, signal);
  },

  // Get specific sanction by ID
  get: (id: string, signal?: AbortSignal) => {
    return apiClient.get<ISanction>(`/sanctions/${id}`, undefined, signal);
  },

  // Update sanction
  update: (id: string, data: Partial<CreateSanctionPayload>, signal?: AbortSignal) => {
    return apiClient.put<ISanction>(`/sanctions/${id}`, data, signal);
  },

  // Delete sanction
  delete: (id: string, signal?: AbortSignal) => {
    return apiClient.delete(`/sanctions/${id}`, signal);
  },

  // Complete sanction
  complete: (id: string, signal?: AbortSignal) => {
    return apiClient.put(`/sanctions/complete`, { id }, signal);
  },

  // Complete all sanctions
  completeAll: (signal?: AbortSignal) => {
    return apiClient.put('/sanctions/complete-all', {}, signal);
  },

  // Check sanctions for escalation
  check: (signal?: AbortSignal) => {
    return apiClient.post('/sanctions/check', {}, signal);
  },

  // Escalate sanction
  escalate: (id: string, signal?: AbortSignal) => {
    return apiClient.put('/sanctions/escalate', { id }, signal);
  },

  // Create random sanction
  createRandom: (data: { severity?: number; category?: string }, signal?: AbortSignal) => {
    return apiClient.post<ISanction>('/sanctions/random', data, signal);
  },

  // Create custom sanction
  createCustom: (data: CreateSanctionPayload, signal?: AbortSignal) => {
    return apiClient.post<ISanction>('/sanctions/custom', data, signal);
  }
};