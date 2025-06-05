import { create } from 'zustand';
import { eventsApi } from '@/lib/api';
import type { CreateEventPayload } from '@/lib/api/types';

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

  // Fetch events from API
  fetchEvents: async (force = false) => {
    const { loading, shouldRefetch } = get();
    
    if (loading || (!force && !shouldRefetch())) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await eventsApi.list();
      
      if (response.success && response.data) {
        set({ 
          events: response.data, 
          loading: false, 
          error: null,
          lastFetch: Date.now()
        });
      } else {
        set({ 
          loading: false, 
          error: response.error || response.message || 'Fehler beim Laden der Events' 
        });
      }
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
      });
    }
  },

  // Create new event
  createEvent: async (data) => {
    try {
      const response = await eventsApi.create(data);
      
      if (response.success && response.data) {
        // Add to local state immediately
        set(state => ({ 
          events: [...state.events, response.data!],
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

  // Update event
  updateEvent: async (id, data) => {
    // Optimistic update
    set(state => ({
      events: state.events.map(e => 
        e._id === id ? { ...e, ...data } : e
      )
    }));

    try {
      const response = await eventsApi.update(id, data);
      
      if (response.success && response.data) {
        set(state => ({
          events: state.events.map(e => 
            e._id === id ? response.data! : e
          ),
          error: null,
          lastFetch: Date.now()
        }));
      } else {
        // Revert optimistic update
        await get().fetchEvents(true);
        set({ error: response.error || response.message || 'Fehler beim Aktualisieren' });
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
      const response = await eventsApi.delete(id);
      
      if (response.success) {
        set({ error: null, lastFetch: Date.now() });
      } else {
        // Revert optimistic update
        await get().fetchEvents(true);
        set({ error: response.error || response.message || 'Fehler beim Löschen' });
      }
    } catch (error) {
      // Revert optimistic update
      await get().fetchEvents(true);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
    }
  },

  // Toggle event active status
  toggleEventActive: async (id) => {
    // Optimistic update
    set(state => ({
      events: state.events.map(e => 
        e._id === id ? { ...e, isActive: !e.isActive } : e
      )
    }));

    try {
      const response = await eventsApi.toggleActive(id);
      
      if (response.success && response.data) {
        set(state => ({
          events: state.events.map(e => 
            e._id === id ? response.data! : e
          ),
          error: null,
          lastFetch: Date.now()
        }));
      } else {
        // Revert optimistic update
        await get().fetchEvents(true);
        set({ error: response.error || response.message || 'Fehler beim Umschalten' });
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
}));