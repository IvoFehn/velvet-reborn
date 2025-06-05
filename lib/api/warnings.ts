import { apiClient } from './client';
import { CreateWarningPayload } from './types';

export const warningsApi = {
  // Get all warnings
  list: (signal?: AbortSignal) => {
    return apiClient.get('/warnings', undefined, signal);
  },

  // Create new warning
  create: (data: CreateWarningPayload, signal?: AbortSignal) => {
    return apiClient.post('/warnings/create', data, signal);
  },

  // Acknowledge warning
  acknowledge: (id: string, signal?: AbortSignal) => {
    return apiClient.post('/warnings/acknowledge', { id }, signal);
  }
};