import { useEffect } from 'react';
import { useProfileStore } from '@/stores/profileStore';
import type { UpdateProfilePayload, AdminUpdatePayload } from '../lib/api';

// Hook for getting profile data
export function useProfile() {
  const {
    profile,
    loading,
    error,
    fetchProfile,
    shouldRefetch
  } = useProfileStore();

  useEffect(() => {
    if (shouldRefetch()) {
      fetchProfile();
    }
  }, [fetchProfile, shouldRefetch]);

  return {
    data: profile,
    loading,
    error,
    refetch: () => fetchProfile()
  };
}

// Hook for updating profile
export function useUpdateProfile() {
  const { updateProfile, loading, error } = useProfileStore(
    (state) => ({
      updateProfile: state.updateProfile,
      loading: state.loading,
      error: state.error
    })
  );

  return {
    mutate: async (data: UpdateProfilePayload) => {
      await updateProfile(data);
      return useProfileStore.getState().profile;
    },
    loading,
    error
  };
}

// Hook for admin profile updates
export function useAdminUpdateProfile() {
  const { updateProfile, loading, error } = useProfileStore(
    (state) => ({
      updateProfile: state.updateProfile,
      loading: state.loading,
      error: state.error
    })
  );

  return {
    mutate: async (data: AdminUpdatePayload) => {
      await updateProfile(data);
      return useProfileStore.getState().profile;
    },
    loading,
    error
  };
}

// Hook for optimistic profile updates (no API call)
export function useOptimisticProfileUpdate() {
  const updateProfileOptimistic = useProfileStore(
    (state) => state.updateProfileOptimistic
  );

  return {
    updateOptimistic: updateProfileOptimistic
  };
}