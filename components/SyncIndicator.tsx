import React from 'react';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useDataProvider } from './providers/DataProvider';

interface SyncIndicatorProps {
  className?: string;
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({ className = '' }) => {
  const { syncStatus } = useDataProvider();
  const { isOnline, lastSync, pendingSync, isLoading } = syncStatus;

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Nie';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60 * 1000) return 'Gerade eben';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h`;
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d`;
  };

  const getSyncStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (pendingSync || isLoading) return 'text-blue-500';
    if (lastSync && Date.now() - lastSync < 5 * 60 * 1000) return 'text-green-500';
    return 'text-yellow-500';
  };

  const getSyncIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (pendingSync || isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    return <Wifi className="h-4 w-4" />;
  };

  const getSyncText = () => {
    if (!isOnline) return 'Offline';
    if (pendingSync) return 'Synchronisiere...';
    if (isLoading) return 'Lade...';
    return `Zuletzt: ${formatLastSync(lastSync)}`;
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${getSyncStatusColor()} ${className}`}>
      {getSyncIcon()}
      <span className="hidden sm:inline">{getSyncText()}</span>
    </div>
  );
};

// Global loading overlay for major operations
export const GlobalLoadingOverlay: React.FC = () => {
  const { shouldShowGlobalLoading } = useAppStore();

  if (!shouldShowGlobalLoading()) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-lg font-medium">Synchronisiere Daten...</p>
      </div>
    </div>
  );
};