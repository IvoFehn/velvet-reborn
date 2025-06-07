import { create } from 'zustand';
import { zalandoApiClient } from '@/lib/api/client-v2';
import type { Profile } from '@/types/profile';

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

interface ProfileStore {
  // State
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  originalProfile: Profile | null; // For rollback
  
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
  cleanup: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useProfileStore = create<ProfileStore>((set, get) => ({
  // Initial state
  profile: null,
  loading: false,
  error: null,
  lastFetch: null,
  originalProfile: null,

  // Check if we should refetch based on cache age
  shouldRefetch: () => {
    const { lastFetch } = get();
    if (!lastFetch) return true;
    return Date.now() - lastFetch > CACHE_DURATION;
  },

  // Invalidate cache
  invalidateCache: () => set({ lastFetch: null }),

  // Fetch profile from API with request deduplication
  fetchProfile: async () => {
    const { profile, loading, shouldRefetch } = get();
    
    // Skip if already loading or data is fresh
    if (loading || (profile && !shouldRefetch())) {
      return;
    }

    const requestKey = 'fetchProfile';
    
    // Return existing request if one is pending
    if (pendingRequests.has(requestKey)) {
      await pendingRequests.get(requestKey);
      return;
    }

    const requestPromise = (async () => {
      set({ loading: true, error: null });

      try {
        const response = await zalandoApiClient.profile.getMe();
        
        if (response.data) {
          set({ 
            profile: response.data as unknown as Profile, 
            loading: false, 
            error: null,
            lastFetch: Date.now()
          });
        } else {
          set({ 
            loading: false, 
            error: response.error?.message || 'Fehler beim Laden des Profils' 
          });
        }
      } catch (error) {
        set({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
        });
      } finally {
        pendingRequests.delete(requestKey);
      }
    })();

    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  },

  // Update profile with API call and improved rollback
  updateProfile: async (updates) => {
    const { profile } = get();
    if (!profile) return;

    const requestKey = `updateProfile-${JSON.stringify(updates)}`;
    
    // Prevent duplicate updates with same data
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey);
    }

    const requestPromise = (async () => {
      // Store original for rollback
      const originalProfile = { ...profile };
      
      // Optimistic update
      const updatedProfile = { ...profile, ...updates };
      set({ 
        profile: updatedProfile,
        originalProfile
      });

      try {
        const response = await zalandoApiClient.profile.updateMe(updates);
        
        if (response.data) {
          set({ 
            profile: response.data as unknown as Profile, 
            error: null,
            lastFetch: Date.now(),
            originalProfile: null
          });
        } else {
          // Revert to original state
          set({ 
            profile: originalProfile, 
            error: response.error?.message || 'Fehler beim Aktualisieren',
            originalProfile: null
          });
        }
      } catch (error) {
        // Revert to original state
        set({ 
          profile: originalProfile, 
          error: error instanceof Error ? error.message : 'Unbekannter Fehler',
          originalProfile: null
        });
      } finally {
        pendingRequests.delete(requestKey);
      }
    })();

    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
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
  
  // Cleanup function
  cleanup: () => {
    // Clear all pending requests
    pendingRequests.clear();
    // Reset state
    set({
      profile: null,
      loading: false,
      error: null,
      lastFetch: null,
      originalProfile: null
    });
  },
}));

// Global cleanup function
export const cleanupProfileStore = () => {
  pendingRequests.clear();
  useProfileStore.getState().cleanup();
};