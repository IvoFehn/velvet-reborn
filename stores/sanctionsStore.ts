import { create } from 'zustand';
import { sanctionsApi } from '@/lib/api';
import type { ISanction } from '@/types/index.d';
import type { CreateSanctionPayload, SanctionFilters } from '@/lib/api/types';

interface SanctionsStore {
  // State
  sanctions: ISanction[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  currentFilters: SanctionFilters | null;
  
  // Actions
  fetchSanctions: (filters?: SanctionFilters, force?: boolean) => Promise<void>;
  createSanction: (data: CreateSanctionPayload) => Promise<ISanction | null>;
  createRandomSanction: (data: { severity?: number; category?: string }) => Promise<ISanction | null>;
  completeSanction: (id: string) => Promise<void>;
  completeAllSanctions: () => Promise<number>;
  escalateSanction: (id: string) => Promise<void>;
  deleteSanction: (id: string) => Promise<void>;
  checkSanctions: () => Promise<{ escalatedCount: number }>;
  
  // Optimistic updates
  addSanctionOptimistic: (sanction: ISanction) => void;
  updateSanctionOptimistic: (id: string, updates: Partial<ISanction>) => void;
  removeSanctionOptimistic: (id: string) => void;
  
  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  shouldRefetch: (filters?: SanctionFilters) => boolean;
  invalidateCache: () => void;
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (sanctions change frequently)

export const useSanctionsStore = create<SanctionsStore>((set, get) => ({
  // Initial state
  sanctions: [],
  loading: false,
  error: null,
  lastFetch: null,
  currentFilters: null,

  // Check if we should refetch
  shouldRefetch: (filters) => {
    const { lastFetch, currentFilters } = get();
    if (!lastFetch) return true;
    
    // Different filters mean we need to refetch
    if (JSON.stringify(filters) !== JSON.stringify(currentFilters)) return true;
    
    return Date.now() - lastFetch > CACHE_DURATION;
  },

  // Invalidate cache
  invalidateCache: () => set({ lastFetch: null }),

  // Fetch sanctions from API
  fetchSanctions: async (filters, force = false) => {
    const { loading, shouldRefetch } = get();
    
    if (loading || (!force && !shouldRefetch(filters))) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await sanctionsApi.list(filters);
      
      if (response.success && response.data) {
        set({ 
          sanctions: response.data, 
          loading: false, 
          error: null,
          lastFetch: Date.now(),
          currentFilters: filters || null
        });
      } else {
        set({ 
          loading: false, 
          error: response.error || response.message || 'Fehler beim Laden der Sanktionen' 
        });
      }
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
      });
    }
  },

  // Create new sanction
  createSanction: async (data) => {
    try {
      const response = await sanctionsApi.create(data);
      
      if (response.success && response.data) {
        // Add to local state immediately
        set(state => ({ 
          sanctions: [...state.sanctions, response.data!],
          error: null,
          lastFetch: Date.now()
        }));
        return response.data;
      } else {
        set({ error: response.error || response.message || 'Fehler beim Erstellen' });
        return null;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
      return null;
    }
  },

  // Create random sanction
  createRandomSanction: async (data) => {
    try {
      const response = await sanctionsApi.createRandom(data);
      
      if (response.success && response.data) {
        // Add to local state immediately
        set(state => ({ 
          sanctions: [...state.sanctions, response.data!],
          error: null,
          lastFetch: Date.now()
        }));
        return response.data;
      } else {
        set({ error: response.error || response.message || 'Fehler beim Erstellen' });
        return null;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
      return null;
    }
  },

  // Complete sanction
  completeSanction: async (id) => {
    // Optimistic update
    set(state => ({
      sanctions: state.sanctions.map(s => 
        s._id.toString() === id ? { ...s, status: 'erledigt' as const } as ISanction : s
      )
    }));

    try {
      const response = await sanctionsApi.complete(id);
      
      if (response.success && response.data) {
        set(state => ({
          sanctions: state.sanctions.map(s => 
            s._id.toString() === id ? response.data! : s
          ),
          error: null,
          lastFetch: Date.now()
        }));
      } else {
        // Revert optimistic update
        await get().fetchSanctions(get().currentFilters || undefined, true);
        set({ error: response.error || response.message || 'Fehler beim Abschließen' });
      }
    } catch (error) {
      // Revert optimistic update
      await get().fetchSanctions(get().currentFilters || undefined, true);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
    }
  },

  // Complete all sanctions
  completeAllSanctions: async () => {
    // Optimistic update
    set(state => ({
      sanctions: state.sanctions.map(s => 
        s.status === 'offen' ? { ...s, status: 'erledigt' as const } as ISanction : s
      )
    }));

    try {
      const response = await sanctionsApi.completeAll();
      
      if (response.success) {
        set({ error: null, lastFetch: Date.now() });
        return response.count || 0;
      } else {
        // Revert optimistic update
        await get().fetchSanctions(get().currentFilters || undefined, true);
        set({ error: response.error || response.message || 'Fehler beim Abschließen' });
        return 0;
      }
    } catch (error) {
      // Revert optimistic update
      await get().fetchSanctions(get().currentFilters || undefined, true);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
      return 0;
    }
  },

  // Escalate sanction
  escalateSanction: async (id) => {
    try {
      const response = await sanctionsApi.escalate(id);
      
      if (response.success) {
        // Refresh data after escalation
        await get().fetchSanctions(get().currentFilters || undefined, true);
        set({ error: null });
      } else {
        set({ error: response.error || response.message || 'Fehler beim Eskalieren' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
    }
  },

  // Delete sanction
  deleteSanction: async (id) => {
    // Optimistic update
    set(state => ({
      sanctions: state.sanctions.filter(s => s._id.toString() !== id)
    }));

    try {
      const response = await sanctionsApi.delete(id);
      
      if (response.success) {
        set({ error: null, lastFetch: Date.now() });
      } else {
        // Revert optimistic update
        await get().fetchSanctions(get().currentFilters || undefined, true);
        set({ error: response.error || response.message || 'Fehler beim Löschen' });
      }
    } catch (error) {
      // Revert optimistic update
      await get().fetchSanctions(get().currentFilters || undefined, true);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
    }
  },

  // Check sanctions for escalation
  checkSanctions: async () => {
    try {
      const response = await sanctionsApi.check();
      
      if (response.success) {
        // Refresh data after check
        await get().fetchSanctions(get().currentFilters || undefined, true);
        set({ error: null });
        return { escalatedCount: response.escalatedCount || 0 };
      } else {
        set({ error: response.error || response.message || 'Fehler beim Prüfen' });
        return { escalatedCount: 0 };
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
      return { escalatedCount: 0 };
    }
  },

  // Optimistic updates
  addSanctionOptimistic: (sanction) => {
    set(state => ({ sanctions: [...state.sanctions, sanction] }));
  },

  updateSanctionOptimistic: (id, updates) => {
    set(state => ({
      sanctions: state.sanctions.map(s => 
        s._id.toString() === id ? { ...s, ...updates } : s
      )
    }));
  },

  removeSanctionOptimistic: (id) => {
    set(state => ({
      sanctions: state.sanctions.filter(s => s._id.toString() !== id)
    }));
  },

  // Utility setters
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));