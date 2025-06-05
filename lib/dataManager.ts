import { useAppStore } from '@/stores/appStore';
import { useProfileStore } from '@/stores/profileStore';
import { useSanctionsStore } from '@/stores/sanctionsStore';
import { useEventsStore } from '@/stores/eventsStore';
import { useTasksStore } from '@/stores/tasksStore';

// Data manager for intelligent caching and synchronization
export class DataManager {
  private static instance: DataManager;
  private syncInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  // Initialize data manager
  initialize() {
    if (this.isInitialized) return;
    
    this.setupNetworkListeners();
    this.setupVisibilityChangeListener();
    this.startPeriodicSync();
    this.isInitialized = true;
  }

  // Setup network change listeners
  private setupNetworkListeners() {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      useAppStore.getState().setOnlineStatus(true);
      this.syncWhenOnline();
    };

    const handleOffline = () => {
      useAppStore.getState().setOnlineStatus(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  // Setup page visibility change listener
  private setupVisibilityChangeListener() {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Page became visible, check if we need to sync
        this.syncIfStale();
      }
    });
  }

  // Start periodic background sync
  private startPeriodicSync() {
    // Sync every 5 minutes when app is active
    this.syncInterval = setInterval(() => {
      if (!document.hidden && useAppStore.getState().isOnline) {
        this.syncIfStale();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Sync data when coming back online
  private async syncWhenOnline() {
    const appStore = useAppStore.getState();
    
    if (!appStore.isOnline) return;

    appStore.setPendingSync(true);
    
    try {
      await this.performFullSync();
      appStore.setLastSync(Date.now());
    } catch (error) {
      console.error('Failed to sync when online:', error);
    } finally {
      appStore.setPendingSync(false);
    }
  }

  // Sync if data is stale
  private async syncIfStale() {
    const appStore = useAppStore.getState();
    const lastSync = appStore.lastSync;
    
    // Don't sync if we synced recently (less than 2 minutes ago)
    if (lastSync && Date.now() - lastSync < 2 * 60 * 1000) {
      return;
    }

    await this.performIntelligentSync();
  }

  // Perform intelligent sync (only refresh stale data)
  private async performIntelligentSync() {
    const appStore = useAppStore.getState();
    
    if (!appStore.isOnline || appStore.pendingSync) return;

    appStore.setPendingSync(true);
    const operations = [];

    try {
      // Check each store and refresh if needed
      const profileStore = useProfileStore.getState();
      if (profileStore.shouldRefetch()) {
        operations.push(profileStore.fetchProfile());
      }

      const sanctionsStore = useSanctionsStore.getState();
      if (sanctionsStore.shouldRefetch()) {
        operations.push(sanctionsStore.fetchSanctions());
      }

      const eventsStore = useEventsStore.getState();
      if (eventsStore.shouldRefetch()) {
        operations.push(eventsStore.fetchEvents());
      }

      const tasksStore = useTasksStore.getState();
      if (tasksStore.shouldRefetch()) {
        operations.push(tasksStore.fetchTasks());
      }

      // Execute all operations in parallel
      await Promise.allSettled(operations);
      appStore.setLastSync(Date.now());
    } catch (error) {
      console.error('Failed to perform intelligent sync:', error);
    } finally {
      appStore.setPendingSync(false);
    }
  }

  // Perform full sync (refresh all data)
  private async performFullSync() {
    const operations = [
      useProfileStore.getState().fetchProfile(),
      useSanctionsStore.getState().fetchSanctions(undefined, true),
      useEventsStore.getState().fetchEvents(true),
      useTasksStore.getState().fetchTasks(true)
    ];

    await Promise.allSettled(operations);
  }

  // Force refresh all data
  async refreshAll() {
    const appStore = useAppStore.getState();
    
    if (!appStore.isOnline) {
      throw new Error('Cannot refresh while offline');
    }

    appStore.setGlobalLoading(true);
    
    try {
      await this.performFullSync();
      appStore.setLastSync(Date.now());
    } finally {
      appStore.setGlobalLoading(false);
    }
  }

  // Invalidate all caches
  invalidateAll() {
    useAppStore.getState().invalidateAllCaches();
  }

  // Cleanup
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isInitialized = false;
  }

  // Get sync status
  getSyncStatus() {
    const appStore = useAppStore.getState();
    return {
      isOnline: appStore.isOnline,
      lastSync: appStore.lastSync,
      pendingSync: appStore.pendingSync,
      isLoading: appStore.shouldShowGlobalLoading()
    };
  }
}

// Export singleton instance
export const dataManager = DataManager.getInstance();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  dataManager.initialize();
}