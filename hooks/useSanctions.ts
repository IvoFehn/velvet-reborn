import { useApiCall, useApiMutation } from './useApi';
import { sanctionsApi, CreateSanctionPayload, SanctionFilters } from '../lib/api';

// Hook for getting sanctions list
export function useSanctions(filters?: SanctionFilters) {
  return useApiCall(() => sanctionsApi.list(filters), [filters]);
}

// Hook for getting specific sanction
export function useSanction(id: string) {
  return useApiCall(() => sanctionsApi.get(id), [id]);
}

// Hook for creating sanction
export function useCreateSanction() {
  return useApiMutation((data: CreateSanctionPayload) => sanctionsApi.create(data));
}

// Hook for creating random sanction
export function useCreateRandomSanction() {
  return useApiMutation((data: { severity?: number; category?: string }) => 
    sanctionsApi.createRandom(data)
  );
}

// Hook for creating custom sanction
export function useCreateCustomSanction() {
  return useApiMutation((data: CreateSanctionPayload) => sanctionsApi.createCustom(data));
}

// Hook for completing sanction
export function useCompleteSanction() {
  return useApiMutation((id: string) => sanctionsApi.complete(id));
}

// Hook for completing all sanctions
export function useCompleteAllSanctions() {
  return useApiMutation(() => sanctionsApi.completeAll());
}

// Hook for checking sanctions
export function useCheckSanctions() {
  return useApiMutation(() => sanctionsApi.check());
}

// Hook for escalating sanction
export function useEscalateSanction() {
  return useApiMutation((id: string) => sanctionsApi.escalate(id));
}

// Hook for updating sanction
export function useUpdateSanction() {
  return useApiMutation(({ id, data }: { id: string; data: Partial<CreateSanctionPayload> }) => 
    sanctionsApi.update(id, data)
  );
}

// Hook for deleting sanction
export function useDeleteSanction() {
  return useApiMutation((id: string) => sanctionsApi.delete(id));
}