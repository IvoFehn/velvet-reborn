import { create } from 'zustand';
import { tasksApi } from '@/lib/api';
import type { CreateTaskPayload } from '@/lib/api/types';

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

  // Fetch tasks from API
  fetchTasks: async (force = false) => {
    const { loading, shouldRefetch } = get();
    
    if (loading || (!force && !shouldRefetch())) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await tasksApi.list();
      
      if (response.success && response.data) {
        set({ 
          tasks: response.data, 
          loading: false, 
          error: null,
          lastFetch: Date.now()
        });
      } else {
        set({ 
          loading: false, 
          error: response.error || response.message || 'Fehler beim Laden der Aufgaben' 
        });
      }
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
      });
    }
  },

  // Create new task
  createTask: async (data) => {
    try {
      const response = await tasksApi.create(data);
      
      if (response.success && response.data) {
        // Add to local state immediately
        set(state => ({ 
          tasks: [...state.tasks, response.data!],
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

  // Update task
  updateTask: async (id, data) => {
    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(t => 
        t._id === id ? { ...t, ...data } : t
      )
    }));

    try {
      const response = await tasksApi.update(id, data);
      
      if (response.success && response.data) {
        set(state => ({
          tasks: state.tasks.map(t => 
            t._id === id ? response.data! : t
          ),
          error: null,
          lastFetch: Date.now()
        }));
      } else {
        // Revert optimistic update
        await get().fetchTasks(true);
        set({ error: response.error || response.message || 'Fehler beim Aktualisieren' });
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
      const response = await tasksApi.delete(id);
      
      if (response.success) {
        set({ error: null, lastFetch: Date.now() });
      } else {
        // Revert optimistic update
        await get().fetchTasks(true);
        set({ error: response.error || response.message || 'Fehler beim Löschen' });
      }
    } catch (error) {
      // Revert optimistic update
      await get().fetchTasks(true);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
    }
  },

  // Toggle task completion
  toggleTask: async (id) => {
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
      const response = await tasksApi.toggle(id);
      
      if (response.success && response.data) {
        set(state => ({
          tasks: state.tasks.map(t => 
            t._id === id ? response.data! : t
          ),
          error: null,
          lastFetch: Date.now()
        }));
      } else {
        // Revert optimistic update
        await get().fetchTasks(true);
        set({ error: response.error || response.message || 'Fehler beim Umschalten' });
      }
    } catch (error) {
      // Revert optimistic update
      await get().fetchTasks(true);
      set({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' });
    }
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
}));