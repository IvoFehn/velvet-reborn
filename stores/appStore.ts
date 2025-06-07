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
  cleanup: () => void;
  
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

    // Cleanup function to prevent memory leaks
    cleanup: () => {
      // Reset state without calling cleanupAppStore to avoid circular reference
      set({
        globalLoading: false,
        loadingOperations: new Set(),
        isOnline: true,
        lastSync: null,
        cacheInvalidationTimestamp: Date.now(),
        pendingSync: false
      });
      console.log('AppStore cleanup called');
    },
  }))
);

// Network status monitoring with proper cleanup
let onlineHandler: (() => void) | null = null;
let offlineHandler: (() => void) | null = null;
let cacheSubscription: (() => void) | null = null;

if (typeof window !== 'undefined') {
  const updateOnlineStatus = () => {
    useAppStore.getState().setOnlineStatus(navigator.onLine);
  };

  onlineHandler = updateOnlineStatus;
  offlineHandler = updateOnlineStatus;

  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);
  
  // Initial status
  updateOnlineStatus();
}

// Subscribe to cache invalidation and propagate to all stores
cacheSubscription = useAppStore.subscribe(
  (state) => state.cacheInvalidationTimestamp,
  async () => {
    // Use Promise.allSettled to handle errors gracefully
    const storeImports = await Promise.allSettled([
      import('./profileStore').then(({ useProfileStore }) => 
        useProfileStore.getState().invalidateCache()
      ),
      import('./sanctionsStore').then(({ useSanctionsStore }) => 
        useSanctionsStore.getState().invalidateCache()
      ),
      import('./eventsStore').then(({ useEventsStore }) => 
        useEventsStore.getState().invalidateCache()
      ),
      import('./tasksStore').then(({ useTasksStore }) => 
        useTasksStore.getState().invalidateCache()
      ),
    ]);

    // Log any failed store invalidations
    storeImports.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(`Failed to invalidate store ${index}:`, result.reason);
      }
    });
  }
);

// Cleanup all stores function
export const cleanupAllStores = async () => {
  try {
    // Call cleanup on all store modules (they export these functions)
    const cleanupPromises = await Promise.allSettled([
      import('./profileStore').then((module) => module.cleanupProfileStore()),
      import('./sanctionsStore').then((module) => module.cleanupSanctionsStore()),
      import('./eventsStore').then((module) => module.cleanupEventsStore()),
      import('./tasksStore').then((module) => module.cleanupTasksStore()),
    ]);
    
    // Log any failed cleanups
    cleanupPromises.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(`Failed to cleanup store ${index}:`, result.reason);
      }
    });
    
    // Cleanup app store last
    cleanupAppStore();
  } catch (error) {
    console.error('Error during store cleanup:', error);
  }
};

// Global cleanup function
export const cleanupAppStore = () => {
  if (typeof window !== 'undefined') {
    if (onlineHandler) {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', onlineHandler);
    }
  }
  
  if (cacheSubscription) {
    cacheSubscription();
    cacheSubscription = null;
  }
  
  onlineHandler = null;
  offlineHandler = null;
};