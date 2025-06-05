import { useApiCall, useApiMutation } from './useApi';
import { profileApi, UpdateProfilePayload, AdminUpdatePayload } from '../lib/api';

// Hook for getting profile data
export function useProfile() {
  return useApiCall(() => profileApi.get());
}

// Hook for updating profile
export function useUpdateProfile() {
  return useApiMutation((data: UpdateProfilePayload) => profileApi.update(data));
}

// Hook for admin profile updates
export function useAdminUpdateProfile() {
  return useApiMutation((data: AdminUpdatePayload) => profileApi.adminUpdate(data));
}

// Hook for creating profile
export function useCreateProfile() {
  return useApiMutation((data: any) => profileApi.create(data));
}

// Hook for adding lootbox to profile
export function useAddLootboxToProfile() {
  return useApiMutation((data: any) => profileApi.addLootbox(data));
}