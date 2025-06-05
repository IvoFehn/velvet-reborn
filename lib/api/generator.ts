import { apiClient } from './client';
import type { GeneratorData } from '../../types.d';

export const generatorApi = {
  // Get all generator entries
  list: (signal?: AbortSignal) => {
    return apiClient.get<GeneratorData[]>('/generator', undefined, signal);
  },

  // Create new generator entry
  create: (data: Partial<GeneratorData>, signal?: AbortSignal) => {
    return apiClient.post<GeneratorData>('/generator', data, signal);
  },

  // Get specific generator entry by ID
  get: (id: string, signal?: AbortSignal) => {
    return apiClient.get<GeneratorData>(`/generator/${id}`, undefined, signal);
  },

  // Update generator entry
  update: (id: string, data: Partial<GeneratorData>, signal?: AbortSignal) => {
    return apiClient.put<GeneratorData>(`/generator/${id}`, data, signal);
  },

  // Delete generator entry
  delete: (id: string, signal?: AbortSignal) => {
    return apiClient.delete(`/generator/${id}`, signal);
  },

  // Accept generator entry
  accept: (id: string, signal?: AbortSignal) => {
    return apiClient.post('/generator/accept', { id }, signal);
  },

  // Reset generator
  reset: (signal?: AbortSignal) => {
    return apiClient.post('/generator-reset', {}, signal);
  }
};