import { useEffect } from 'react';
import { useSanctionsStore } from '@/stores/sanctionsStore';
import type { CreateSanctionPayload, SanctionFilters } from '../lib/api';

// Hook for getting sanctions list
export function useSanctions(filters?: SanctionFilters) {
  const {
    sanctions,
    loading,
    error,
    fetchSanctions,
    shouldRefetch
  } = useSanctionsStore();

  useEffect(() => {
    if (shouldRefetch(filters)) {
      fetchSanctions(filters);
    }
  }, [fetchSanctions, shouldRefetch, JSON.stringify(filters)]);

  return {
    data: sanctions,
    loading,
    error,
    refetch: () => fetchSanctions(filters, true)
  };
}

// Hook for creating sanction
export function useCreateSanction() {
  const { createSanction, loading, error } = useSanctionsStore(
    (state) => ({
      createSanction: state.createSanction,
      loading: state.loading,
      error: state.error
    })
  );

  return {
    mutate: createSanction,
    loading,
    error
  };
}

// Hook for creating random sanction
export function useCreateRandomSanction() {
  const { createRandomSanction, loading, error } = useSanctionsStore(
    (state) => ({
      createRandomSanction: state.createRandomSanction,
      loading: state.loading,
      error: state.error
    })
  );

  return {
    mutate: createRandomSanction,
    loading,
    error
  };
}

// Hook for completing sanction
export function useCompleteSanction() {
  const { completeSanction, loading, error } = useSanctionsStore(
    (state) => ({
      completeSanction: state.completeSanction,
      loading: state.loading,
      error: state.error
    })
  );

  return {
    mutate: completeSanction,
    loading,
    error
  };
}

// Hook for completing all sanctions
export function useCompleteAllSanctions() {
  const { completeAllSanctions, loading, error } = useSanctionsStore(
    (state) => ({
      completeAllSanctions: state.completeAllSanctions,
      loading: state.loading,
      error: state.error
    })
  );

  return {
    mutate: completeAllSanctions,
    loading,
    error
  };
}

// Hook for checking sanctions
export function useCheckSanctions() {
  const { checkSanctions, loading, error } = useSanctionsStore(
    (state) => ({
      checkSanctions: state.checkSanctions,
      loading: state.loading,
      error: state.error
    })
  );

  return {
    mutate: checkSanctions,
    loading,
    error
  };
}

// Hook for escalating sanction
export function useEscalateSanction() {
  const { escalateSanction, loading, error } = useSanctionsStore(
    (state) => ({
      escalateSanction: state.escalateSanction,
      loading: state.loading,
      error: state.error
    })
  );

  return {
    mutate: escalateSanction,
    loading,
    error
  };
}

// Hook for deleting sanction
export function useDeleteSanction() {
  const { deleteSanction, loading, error } = useSanctionsStore(
    (state) => ({
      deleteSanction: state.deleteSanction,
      loading: state.loading,
      error: state.error
    })
  );

  return {
    mutate: deleteSanction,
    loading,
    error
  };
}

// Hook for optimistic sanctions updates
export function useOptimisticSanctionsUpdate() {
  const {
    addSanctionOptimistic,
    updateSanctionOptimistic,
    removeSanctionOptimistic
  } = useSanctionsStore(
    (state) => ({
      addSanctionOptimistic: state.addSanctionOptimistic,
      updateSanctionOptimistic: state.updateSanctionOptimistic,
      removeSanctionOptimistic: state.removeSanctionOptimistic
    })
  );

  return {
    addOptimistic: addSanctionOptimistic,
    updateOptimistic: updateSanctionOptimistic,
    removeOptimistic: removeSanctionOptimistic
  };
}