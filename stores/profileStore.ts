import { create } from 'zustand';
import { profileApi } from '@/lib/api';
import type { Profile } from '@/types/profile';

interface ProfileStore {
  // State
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateProfileOptimistic: (updates: Partial<Profile>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Cache management
  shouldRefetch: () => boolean;
  invalidateCache: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useProfileStore = create<ProfileStore>((set, get) => ({
  // Initial state
  profile: null,
  loading: false,
  error: null,
  lastFetch: null,

  // Check if we should refetch based on cache age
  shouldRefetch: () => {
    const { lastFetch } = get();
    if (!lastFetch) return true;
    return Date.now() - lastFetch > CACHE_DURATION;
  },

  // Invalidate cache
  invalidateCache: () => set({ lastFetch: null }),

  // Fetch profile from API
  fetchProfile: async () => {
    const { profile, loading, shouldRefetch } = get();
    
    // Skip if already loading or data is fresh
    if (loading || (profile && !shouldRefetch())) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await profileApi.get();
      
      if (response.success && response.data) {
        set({ 
          profile: response.data, 
          loading: false, 
          error: null,
          lastFetch: Date.now()
        });
      } else {
        set({ 
          loading: false, 
          error: response.error || response.message || 'Fehler beim Laden des Profils' 
        });
      }
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
      });
    }
  },

  // Update profile with API call
  updateProfile: async (updates) => {
    const { profile } = get();
    if (!profile) return;

    // Optimistic update
    const updatedProfile = { ...profile, ...updates };
    set({ profile: updatedProfile });

    try {
      const response = await profileApi.update(updates);
      
      if (response.success && response.data) {
        set({ 
          profile: response.data, 
          error: null,
          lastFetch: Date.now()
        });
      } else {
        // Revert optimistic update on error
        set({ 
          profile, 
          error: response.error || response.message || 'Fehler beim Aktualisieren' 
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      set({ 
        profile, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
      });
    }
  },

  // Optimistic update without API call
  updateProfileOptimistic: (updates) => {
    const { profile } = get();
    if (!profile) return;
    
    set({ profile: { ...profile, ...updates } });
  },

  // Utility setters
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));