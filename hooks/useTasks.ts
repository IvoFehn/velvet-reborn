import { useApiCall, useApiMutation } from './useApi';
import { tasksApi, CreateTaskPayload } from '../lib/api';

// Hook for getting tasks list
export function useTasks() {
  return useApiCall(() => tasksApi.list());
}

// Hook for getting specific task
export function useTask(id: string) {
  return useApiCall(() => tasksApi.get(id), [id]);
}

// Hook for creating task
export function useCreateTask() {
  return useApiMutation((data: CreateTaskPayload) => tasksApi.create(data));
}

// Hook for updating task
export function useUpdateTask() {
  return useApiMutation(({ id, data }: { id: string; data: Partial<CreateTaskPayload> }) => 
    tasksApi.update(id, data)
  );
}

// Hook for deleting task
export function useDeleteTask() {
  return useApiMutation((id: string) => tasksApi.delete(id));
}

// Hook for toggling task completion
export function useToggleTask() {
  return useApiMutation((id: string) => tasksApi.toggle(id));
}