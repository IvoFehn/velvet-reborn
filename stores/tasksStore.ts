import { create } from 'zustand';
import { zalandoApiClient } from '@/lib/api/client-v2';
import type { CreateTaskPayload } from '@/lib/api/types';

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

interface Task {
  _id: string;
  title: string;
  description: string;
  difficulty: number;
  goldReward: number;
  expReward: number;
  type: string;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface TasksStore {
  // State
  tasks: Task[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Actions
  fetchTasks: (force?: boolean) => Promise<void>;
  createTask: (data: CreateTaskPayload) => Promise<Task | null>;
  updateTask: (id: string, data: Partial<CreateTaskPayload>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  
  // Optimistic updates
  addTaskOptimistic: (task: Task) => void;
  updateTaskOptimistic: (id: string, updates: Partial<Task>) => void;
  removeTaskOptimistic: (id: string) => void;
  
  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  shouldRefetch: () => boolean;
  invalidateCache: () => void;
  cleanup: () => void;
  
  // Computed
  getCompletedTasks: () => Task[];
  getPendingTasks: () => Task[];
}

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

export const useTasksStore = create<TasksStore>((set, get) => ({
  // Initial state
  tasks: [],
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

  // Fetch tasks from API with request deduplication
  fetchTasks: async (force = false) => {
    const { loading, shouldRefetch } = get();
    
    if (loading || (!force && !shouldRefetch())) {
      return;
    }

    const requestKey = 'fetchTasks';
    
    // Return existing request if one is pending
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey);
    }

    const requestPromise = (async () => {
      set({ loading: true, error: null });

      try {
        const response = await zalandoApiClient.tasks.list();
        
        if (response.data) {
          set({ 
            tasks: response.data as any, 
            loading: false, 
            error: null,
            lastFetch: Date.now()
          });
        } else {
          set({ 
            loading: false, 
            error: response.error?.message || 'Fehler beim Laden der Aufgaben' 
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

  // Create new task
  createTask: async (data): Promise<Task | null> => {
    try {
      const response = await zalandoApiClient.tasks.create(data);
      
      if (response.data) {
        // Add to local state immediately
        set(state => ({ 
          tasks: [...state.tasks, response.data as any],
          error: null,
          lastFetch: Date.now()
        }));
        return response.data as any;
      } else {
        set({ error: response.error?.message || 'Fehler beim Erstellen' });
        return null;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
      return null;
    }
  },

  // Update task
  updateTask: async (id, data) => {
    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(t => 
        t._id === id ? { ...t, ...data } : t
      )
    }));

    try {
      const response = await zalandoApiClient.tasks.update(id, data);
      
      if (response.data) {
        set(state => ({
          tasks: state.tasks.map(t => 
            t._id === id ? response.data as any : t
          ),
          error: null,
          lastFetch: Date.now()
        }));
      } else {
        // Revert optimistic update
        await get().fetchTasks(true);
        set({ error: response.error?.message || 'Fehler beim Aktualisieren' });
      }
    } catch (error) {
      // Revert optimistic update
      await get().fetchTasks(true);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
    }
  },

  // Delete task
  deleteTask: async (id) => {
    // Optimistic update
    set(state => ({
      tasks: state.tasks.filter(t => t._id !== id)
    }));

    try {
      const response = await zalandoApiClient.tasks.delete(id);
      
      // Note: delete returns void, so check for no error
      set({ error: null, lastFetch: Date.now() });
    } catch (error) {
      // Revert optimistic update
      await get().fetchTasks(true);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
    }
  },

  // Toggle task completion with better race condition handling
  toggleTask: async (id) => {
    const requestKey = `toggleTask-${id}`;
    
    // Prevent duplicate requests
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey);
    }

    const requestPromise = (async () => {
      // Store original state for rollback
      const originalTasks = [...get().tasks];
      const currentTask = originalTasks.find(t => t._id === id);
      
      if (!currentTask) return;
      
      // Optimistic update
      set(state => ({
        tasks: state.tasks.map(t => 
          t._id === id ? { 
            ...t, 
            completed: !t.completed,
            completedAt: !t.completed ? new Date() : undefined
          } : t
        )
      }));

      try {
        const response = await zalandoApiClient.tasks.complete(id);
        
        if (response.data) {
          set(state => ({
            tasks: state.tasks.map(t => 
              t._id === id ? response.data as any : t
            ),
            error: null,
            lastFetch: Date.now()
          }));
        } else {
          // Revert to original state
          set({ 
            tasks: originalTasks,
            error: response.error?.message || 'Fehler beim Umschalten' 
          });
        }
      } catch (error) {
        // Revert to original state
        set({ 
          tasks: originalTasks,
          error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
        });
      } finally {
        pendingRequests.delete(requestKey);
      }
    })();

    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  },

  // Optimistic updates
  addTaskOptimistic: (task) => {
    set(state => ({ tasks: [...state.tasks, task] }));
  },

  updateTaskOptimistic: (id, updates) => {
    set(state => ({
      tasks: state.tasks.map(t => 
        t._id === id ? { ...t, ...updates } : t
      )
    }));
  },

  removeTaskOptimistic: (id) => {
    set(state => ({
      tasks: state.tasks.filter(t => t._id !== id)
    }));
  },

  // Computed selectors
  getCompletedTasks: () => {
    return get().tasks.filter(task => task.completed);
  },

  getPendingTasks: () => {
    return get().tasks.filter(task => !task.completed);
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
      tasks: [],
      loading: false,
      error: null,
      lastFetch: null
    });
  },
}));

// Global cleanup function
export const cleanupTasksStore = () => {
  pendingRequests.clear();
  useTasksStore.getState().cleanup();
};