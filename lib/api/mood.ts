import { apiClient } from './client';

export const moodApi = {
  // Get current mood status
  getCurrent: (signal?: AbortSignal) => {
    return apiClient.get('/mood/current', undefined, signal);
  },

  // Get mood history
  getHistory: (params?: { startDate?: string; endDate?: string; limit?: number }, signal?: AbortSignal) => {
    return apiClient.get('/mood', params, signal);
  },

  // Submit new mood entry
  submit: (data: { level: number; note?: string; timestamp?: Date }, signal?: AbortSignal) => {
    return apiClient.post('/mood', data, signal);
  },

  // Update mood entry
  update: (data: { level: number; note?: string; timestamp?: Date }, signal?: AbortSignal) => {
    return apiClient.put('/mood', data, signal);
  },

  // Get mood status for admin
  getStatus: (signal?: AbortSignal) => {
    return apiClient.get('/mood-status', undefined, signal);
  },

  // Reset mood (admin)
  reset: (signal?: AbortSignal) => {
    return apiClient.post('/mood-reset', {}, signal);
  },

  // Override mood (admin)
  override: (data: { level: number; reason?: string }, signal?: AbortSignal) => {
    return apiClient.post('/mood-override', data, signal);
  },

  // Send Telegram notification
  sendTelegramNotification: (data: { message: string; level?: number }, signal?: AbortSignal) => {
    return apiClient.post('/mood-telegram-notification', data, signal);
  }
};