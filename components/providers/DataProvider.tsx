import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { dataManager } from '@/lib/dataManager';
import { useAppStore } from '@/stores/appStore';

interface DataProviderContext {
  refreshAll: () => Promise<void>;
  invalidateAll: () => void;
  syncStatus: {
    isOnline: boolean;
    lastSync: number | null;
    pendingSync: boolean;
    isLoading: boolean;
  };
}

const DataContext = createContext<DataProviderContext | null>(null);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const appStore = useAppStore();

  useEffect(() => {
    // Initialize data manager on mount
    dataManager.initialize();

    // Cleanup on unmount
    return () => {
      dataManager.destroy();
    };
  }, []);

  const refreshAll = async () => {
    try {
      await dataManager.refreshAll();
    } catch (error) {
      console.error('Failed to refresh all data:', error);
    }
  };

  const invalidateAll = () => {
    dataManager.invalidateAll();
  };

  const syncStatus = {
    isOnline: appStore.isOnline,
    lastSync: appStore.lastSync,
    pendingSync: appStore.pendingSync,
    isLoading: appStore.shouldShowGlobalLoading()
  };

  const value: DataProviderContext = {
    refreshAll,
    invalidateAll,
    syncStatus
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataProvider = (): DataProviderContext => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataProvider must be used within a DataProvider');
  }
  return context;
};