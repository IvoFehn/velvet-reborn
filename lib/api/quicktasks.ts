import { apiClient } from './client';
import { CreateQuickTaskPayload, UpdateQuickTaskPayload } from './types';

export const quickTasksApi = {
  // Get all quick tasks
  list: (signal?: AbortSignal) => {
    return apiClient.get('/quicktasks', undefined, signal);
  },

  // Create new quick task
  create: (data: CreateQuickTaskPayload, signal?: AbortSignal) => {
    return apiClient.post('/quicktasks', data, signal);
  },

  // Get specific quick task by ID
  get: (id: string, signal?: AbortSignal) => {
    return apiClient.get(`/quicktasks/${id}`, undefined, signal);
  },

  // Update quick task
  update: (id: string, data: UpdateQuickTaskPayload, signal?: AbortSignal) => {
    return apiClient.put(`/quicktasks/${id}`, data, signal);
  },

  // Delete quick task
  delete: (id: string, signal?: AbortSignal) => {
    return apiClient.delete(`/quicktasks/${id}`, signal);
  }
};