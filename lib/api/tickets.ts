import { apiClient } from './client';
import { CreateTicketPayload, TicketMessage } from './types';

export const ticketsApi = {
  // Get all tickets
  list: (signal?: AbortSignal) => {
    return apiClient.get('/tickets', undefined, signal);
  },

  // Create new ticket
  create: (data: CreateTicketPayload, signal?: AbortSignal) => {
    return apiClient.post('/tickets', data, signal);
  },

  // Get specific ticket by ID
  get: (id: string, signal?: AbortSignal) => {
    return apiClient.get(`/tickets/${id}`, undefined, signal);
  },

  // Update ticket
  update: (id: string, data: Partial<CreateTicketPayload>, signal?: AbortSignal) => {
    return apiClient.put(`/tickets/${id}`, data, signal);
  },

  // Delete ticket
  delete: (id: string, signal?: AbortSignal) => {
    return apiClient.delete(`/tickets/${id}`, signal);
  },

  // Change ticket status
  changeStatus: (id: string, status: string, signal?: AbortSignal) => {
    return apiClient.put('/tickets/changeStatus', { id, status }, signal);
  },

  // Get ticket messages
  getMessages: (id: string, signal?: AbortSignal) => {
    return apiClient.get(`/tickets/${id}/messages`, undefined, signal);
  },

  // Add message to ticket
  addMessage: (id: string, message: TicketMessage, signal?: AbortSignal) => {
    return apiClient.post(`/tickets/${id}/messages`, message, signal);
  }
};