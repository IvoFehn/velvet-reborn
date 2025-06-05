import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface AppStore {
  // Global loading states
  globalLoading: boolean;
  loadingOperations: Set<string>;
  
  // Network status
  isOnline: boolean;
  lastSync: number | null;
  
  // Cache management
  cacheInvalidationTimestamp: number;
  pendingSync: boolean;
  
  // Actions
  setGlobalLoading: (loading: boolean) => void;
  addLoadingOperation: (operation: string) => void;
  removeLoadingOperation: (operation: string) => void;
  setOnlineStatus: (online: boolean) => void;
  setLastSync: (timestamp: number) => void;
  invalidateAllCaches: () => void;
  setPendingSync: (pending: boolean) => void;
  
  // Computed
  isAnyLoading: () => boolean;
  shouldShowGlobalLoading: () => boolean;
}

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    globalLoading: false,
    loadingOperations: new Set<string>(),
    isOnline: true,
    lastSync: null,
    cacheInvalidationTimestamp: Date.now(),
    pendingSync: false,

    // Set global loading state
    setGlobalLoading: (loading) => set({ globalLoading: loading }),

    // Add loading operation
    addLoadingOperation: (operation) => {
      set(state => ({
        loadingOperations: new Set([...state.loadingOperations, operation])
      }));
    },

    // Remove loading operation
    removeLoadingOperation: (operation) => {
      set(state => {
        const newOperations = new Set(state.loadingOperations);
        newOperations.delete(operation);
        return { loadingOperations: newOperations };
      });
    },

    // Set online status
    setOnlineStatus: (online) => set({ isOnline: online }),

    // Set last sync timestamp
    setLastSync: (timestamp) => set({ lastSync: timestamp }),

    // Invalidate all caches
    invalidateAllCaches: () => set({ cacheInvalidationTimestamp: Date.now() }),

    // Set pending sync status
    setPendingSync: (pending) => set({ pendingSync: pending }),

    // Check if any loading operation is active
    isAnyLoading: () => {
      const { globalLoading, loadingOperations } = get();
      return globalLoading || loadingOperations.size > 0;
    },

    // Should show global loading indicator
    shouldShowGlobalLoading: () => {
      const { globalLoading, loadingOperations } = get();
      return globalLoading || loadingOperations.size > 2; // Show when many operations
    },
  }))
);

// Network status monitoring
if (typeof window !== 'undefined') {
  const updateOnlineStatus = () => {
    useAppStore.getState().setOnlineStatus(navigator.onLine);
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial status
  updateOnlineStatus();
}

// Subscribe to cache invalidation and propagate to all stores
useAppStore.subscribe(
  (state) => state.cacheInvalidationTimestamp,
  () => {
    // Import stores dynamically to avoid circular dependencies
    import('./profileStore').then(({ useProfileStore }) => {
      useProfileStore.getState().invalidateCache();
    });
    import('./sanctionsStore').then(({ useSanctionsStore }) => {
      useSanctionsStore.getState().invalidateCache();
    });
    import('./eventsStore').then(({ useEventsStore }) => {
      useEventsStore.getState().invalidateCache();
    });
    import('./tasksStore').then(({ useTasksStore }) => {
      useTasksStore.getState().invalidateCache();
    });
  }
);