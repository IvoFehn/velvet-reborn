import { apiClient } from './client';
import { CreateTaskPayload } from './types';

export const tasksApi = {
  // Get all daily tasks
  list: (signal?: AbortSignal) => {
    return apiClient.get('/tasks', undefined, signal);
  },

  // Create new task
  create: (data: CreateTaskPayload, signal?: AbortSignal) => {
    return apiClient.post('/tasks', data, signal);
  },

  // Get specific task by ID
  get: (id: string, signal?: AbortSignal) => {
    return apiClient.get(`/tasks/${id}`, undefined, signal);
  },

  // Update task
  update: (id: string, data: Partial<CreateTaskPayload>, signal?: AbortSignal) => {
    return apiClient.put(`/tasks/${id}`, data, signal);
  },

  // Delete task
  delete: (id: string, signal?: AbortSignal) => {
    return apiClient.delete(`/tasks/${id}`, signal);
  },

  // Toggle task completion
  toggle: (id: string, signal?: AbortSignal) => {
    return apiClient.put(`/tasks/${id}/toggle`, {}, signal);
  }
};