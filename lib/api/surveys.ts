import { apiClient } from './client';
import { SubmitSurveyPayload } from './types';

export const surveysApi = {
  // Get survey status
  getStatus: (signal?: AbortSignal) => {
    return apiClient.get('/survey/status', undefined, signal);
  },

  // Submit survey responses
  submit: (data: SubmitSurveyPayload, signal?: AbortSignal) => {
    return apiClient.post('/survey', data, signal);
  },

  // Admin: Get all surveys
  adminList: (signal?: AbortSignal) => {
    return apiClient.get('/admin/surveys', undefined, signal);
  },

  // Admin: Create new survey
  adminCreate: (data: any, signal?: AbortSignal) => {
    return apiClient.post('/admin/surveys', data, signal);
  }
};