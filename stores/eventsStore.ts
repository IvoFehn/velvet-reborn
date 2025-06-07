import { create } from 'zustand';
import { zalandoApiClient } from '@/lib/api/client-v2';
import type { CreateEventPayload } from '@/lib/api/types';

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface EventsStore {
  // State
  events: Event[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Actions
  fetchEvents: (force?: boolean) => Promise<void>;
  createEvent: (data: CreateEventPayload) => Promise<Event | null>;
  updateEvent: (id: string, data: Partial<CreateEventPayload>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  toggleEventActive: (id: string) => Promise<void>;
  
  // Optimistic updates
  addEventOptimistic: (event: Event) => void;
  updateEventOptimistic: (id: string, updates: Partial<Event>) => void;
  removeEventOptimistic: (id: string) => void;
  
  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  shouldRefetch: () => boolean;
  invalidateCache: () => void;
  cleanup: () => void;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (events change less frequently)

export const useEventsStore = create<EventsStore>((set, get) => ({
  // Initial state
  events: [],
  loading: false,
  error: null,
  lastFetch: null,

  // Check if we should refetch
  shouldRefetch: () => {
    const { lastFetch } = get();
    if (!lastFetch) return true;
    return Date.now() - lastFetch > CACHE_DURATION;
  },

  // Invalidate cache
  invalidateCache: () => set({ lastFetch: null }),

  // Fetch events from API with request deduplication
  fetchEvents: async (force = false) => {
    const { loading, shouldRefetch } = get();
    
    if (loading || (!force && !shouldRefetch())) {
      return;
    }

    const requestKey = 'fetchEvents';
    
    // Return existing request if one is pending
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey);
    }

    const requestPromise = (async () => {
      set({ loading: true, error: null });

      try {
        const response = await zalandoApiClient.events.list();
        
        if (response.data) {
          set({ 
            events: response.data as unknown as Event[], 
            loading: false, 
            error: null,
            lastFetch: Date.now()
          });
        } else {
          set({ 
            loading: false, 
            error: response.error?.message || 'Fehler beim Laden der Events' 
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

  // Create new event
  createEvent: async (data): Promise<Event | null> => {
    try {
      const response = await zalandoApiClient.events.create(data as unknown as Parameters<typeof zalandoApiClient.events.create>[0]);
      
      if (response.data) {
        // Add to local state immediately
        set(state => ({ 
          events: [...state.events, response.data as unknown as Event],
          error: null,
          lastFetch: Date.now()
        }));
        return response.data as unknown as Event;
      } else {
        set({ error: response.error?.message || 'Fehler beim Erstellen' });
        return null;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
      return null;
    }
  },

  // Update event
  updateEvent: async (id, data) => {
    // Optimistic update
    set(state => ({
      events: state.events.map(e => 
        e._id === id ? { ...e, ...data } : e
      )
    }));

    try {
      const response = await zalandoApiClient.events.update(id, data);
      
      if (response.data) {
        set(state => ({
          events: state.events.map(e => 
            e._id === id ? response.data as unknown as Event : e
          ),
          error: null,
          lastFetch: Date.now()
        }));
      } else {
        // Revert optimistic update
        await get().fetchEvents(true);
        set({ error: response.error?.message || 'Fehler beim Aktualisieren' });
      }
    } catch (error) {
      // Revert optimistic update
      await get().fetchEvents(true);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
    }
  },

  // Delete event
  deleteEvent: async (id) => {
    // Optimistic update
    set(state => ({
      events: state.events.filter(e => e._id !== id)
    }));

    try {
      const response = await zalandoApiClient.events.delete(id);
      
      // Note: delete returns void, so check for no error
      set({ error: null, lastFetch: Date.now() });
    } catch (error) {
      // Revert optimistic update
      await get().fetchEvents(true);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
    }
  },

  // Toggle event active status
  toggleEventActive: async (id) => {
    // Get current event to determine new active state
    const { events } = get();
    const currentEvent = events.find(e => e._id === id);
    if (!currentEvent) return;

    const newActiveState = !currentEvent.isActive;

    // Optimistic update
    set(state => ({
      events: state.events.map(e => 
        e._id === id ? { ...e, isActive: newActiveState } : e
      )
    }));

    try {
      const response = await zalandoApiClient.events.update(id, { isActive: newActiveState } as any);
      
      if (response.data) {
        set(state => ({
          events: state.events.map(e => 
            e._id === id ? response.data as unknown as Event : e
          ),
          error: null,
          lastFetch: Date.now()
        }));
      } else {
        // Revert optimistic update
        await get().fetchEvents(true);
        set({ error: response.error?.message || 'Fehler beim Umschalten' });
      }
    } catch (error) {
      // Revert optimistic update
      await get().fetchEvents(true);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
    }
  },

  // Optimistic updates
  addEventOptimistic: (event) => {
    set(state => ({ events: [...state.events, event] }));
  },

  updateEventOptimistic: (id, updates) => {
    set(state => ({
      events: state.events.map(e => 
        e._id === id ? { ...e, ...updates } : e
      )
    }));
  },

  removeEventOptimistic: (id) => {
    set(state => ({
      events: state.events.filter(e => e._id !== id)
    }));
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
      events: [],
      loading: false,
      error: null,
      lastFetch: null
    });
  },
}));

// Global cleanup function
export const cleanupEventsStore = () => {
  pendingRequests.clear();
  useEventsStore.getState().cleanup();
};