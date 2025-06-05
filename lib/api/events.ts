import { apiClient } from './client';
import { CreateEventPayload } from './types';

export const eventsApi = {
  // Get all events
  list: (signal?: AbortSignal) => {
    return apiClient.get('/events', undefined, signal);
  },

  // Create new event
  create: (data: CreateEventPayload, signal?: AbortSignal) => {
    return apiClient.post('/events', data, signal);
  },

  // Get specific event by ID
  get: (id: string, signal?: AbortSignal) => {
    return apiClient.get(`/events/${id}`, undefined, signal);
  },

  // Update event
  update: (id: string, data: Partial<CreateEventPayload>, signal?: AbortSignal) => {
    return apiClient.put(`/events/${id}`, data, signal);
  },

  // Delete event
  delete: (id: string, signal?: AbortSignal) => {
    return apiClient.delete(`/events/${id}`, signal);
  },

  // Toggle event active status
  toggleActive: (id: string, signal?: AbortSignal) => {
    return apiClient.patch(`/events/${id}`, { isActive: 'toggle' }, signal);
  }
};