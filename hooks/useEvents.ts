import { useApiCall, useApiMutation } from './useApi';
import { eventsApi, CreateEventPayload } from '../lib/api';

// Hook for getting events list
export function useEvents() {
  return useApiCall(() => eventsApi.list());
}

// Hook for getting specific event
export function useEvent(id: string) {
  return useApiCall(() => eventsApi.get(id), [id]);
}

// Hook for creating event
export function useCreateEvent() {
  return useApiMutation((data: CreateEventPayload) => eventsApi.create(data));
}

// Hook for updating event
export function useUpdateEvent() {
  return useApiMutation(({ id, data }: { id: string; data: Partial<CreateEventPayload> }) => 
    eventsApi.update(id, data)
  );
}

// Hook for deleting event
export function useDeleteEvent() {
  return useApiMutation((id: string) => eventsApi.delete(id));
}

// Hook for toggling event active status
export function useToggleEventActive() {
  return useApiMutation((id: string) => eventsApi.toggleActive(id));
}