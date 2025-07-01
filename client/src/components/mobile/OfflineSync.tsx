import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Upload, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { useToast } from '../../../hooks/use-toast';

interface OfflineData {
  id: string;
  type: 'check-in' | 'photo' | 'testimonial' | 'note';
  data: any;
  timestamp: number;
  retryCount: number;
  size?: number;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSync: number | null;
  syncProgress: number;
  errors: string[];
}

interface OfflineSyncProps {
  onDataSync?: (success: boolean, count: number) => void;
  maxRetries?: number;
  syncInterval?: number;
  enableAutoSync?: boolean;
}

const OfflineSync: React.FC<OfflineSyncProps> = ({
  onDataSync,
  maxRetries = 3,
  syncInterval = 30000, // 30 seconds
  enableAutoSync = true
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    lastSync: null,
    syncProgress: 0,
    errors: []
  });

  const [offlineQueue, setOfflineQueue] = useState<OfflineData[]>([]);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load offline data from localStorage on mount
  useEffect(() => {
    loadOfflineData();
    setupNetworkListeners();
    
    if (enableAutoSync) {
      startAutoSync();
    }

    return () => {
      cleanup();
    };
  }, [enableAutoSync, syncInterval]);

  // Auto sync when coming back online
  useEffect(() => {
    if (syncStatus.isOnline && offlineQueue.length > 0 && enableAutoSync) {
      setTimeout(() => syncData(), 1000); // Small delay to ensure connection is stable
    }
  }, [syncStatus.isOnline, offlineQueue.length, enableAutoSync]);

  // Setup network status listeners
  const setupNetworkListeners = () => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true, errors: [] }));
      toast({
        title: "Connection Restored",
        description: "Back online. Preparing to sync data...",
      });
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "Connection Lost",
        description: "Working offline. Data will sync when connected.",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  // Start automatic sync interval
  const startAutoSync = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(() => {
      if (syncStatus.isOnline && offlineQueue.length > 0 && !syncStatus.isSyncing) {
        syncData();
      }
    }, syncInterval);
  };

  // Load offline data from localStorage
  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem('rankitpro_offline_queue');
      if (stored) {
        const data = JSON.parse(stored);
        setOfflineQueue(data);
        setSyncStatus(prev => ({ ...prev, pendingCount: data.length }));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  // Save offline data to localStorage
  const saveOfflineData = (data: OfflineData[]) => {
    try {
      localStorage.setItem('rankitpro_offline_queue', JSON.stringify(data));
      setSyncStatus(prev => ({ ...prev, pendingCount: data.length }));
    } catch (error) {
      console.error('Failed to save offline data:', error);
      toast({
        title: "Storage Error",
        description: "Unable to save offline data. Storage may be full.",
        variant: "destructive"
      });
    }
  };

  // Add data to offline queue
  const addToOfflineQueue = (type: OfflineData['type'], data: any) => {
    const offlineItem: OfflineData = {
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      size: JSON.stringify(data).length
    };

    const updatedQueue = [...offlineQueue, offlineItem];
    setOfflineQueue(updatedQueue);
    saveOfflineData(updatedQueue);

    toast({
      title: "Data Queued",
      description: `${type} saved offline. Will sync when connected.`,
    });
  };

  // Sync all offline data
  const syncData = async () => {
    if (!syncStatus.isOnline || syncStatus.isSyncing || offlineQueue.length === 0) {
      return;
    }

    setSyncStatus(prev => ({ 
      ...prev, 
      isSyncing: true, 
      syncProgress: 0,
      errors: []
    }));

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      for (let i = 0; i < offlineQueue.length; i++) {
        const item = offlineQueue[i];
        
        try {
          const success = await syncItem(item);
          
          if (success) {
            successCount++;
          } else {
            // Increment retry count
            item.retryCount++;
            if (item.retryCount >= maxRetries) {
              errors.push(`Failed to sync ${item.type} after ${maxRetries} attempts`);
              errorCount++;
            }
          }
          
          // Update progress
          setSyncStatus(prev => ({
            ...prev,
            syncProgress: Math.round(((i + 1) / offlineQueue.length) * 100)
          }));
          
        } catch (error) {
          console.error(`Sync error for item ${item.id}:`, error);
          item.retryCount++;
          if (item.retryCount >= maxRetries) {
            errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            errorCount++;
          }
        }
      }

      // Remove successfully synced items and items that exceeded retry limit
      const remainingQueue = offlineQueue.filter(item => 
        item.retryCount < maxRetries && 
        !offlineQueue.slice(0, successCount).includes(item)
      );

      setOfflineQueue(remainingQueue);
      saveOfflineData(remainingQueue);

      // Update sync status
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: Date.now(),
        syncProgress: 100,
        errors,
        pendingCount: remainingQueue.length
      }));

      // Show completion toast
      if (successCount > 0 || errorCount > 0) {
        toast({
          title: "Sync Complete",
          description: `${successCount} items synced successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
          variant: errorCount > 0 ? "destructive" : "default"
        });
      }

      // Callback
      if (onDataSync) {
        onDataSync(errorCount === 0, successCount);
      }

    } catch (error) {
      console.error('Sync process error:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        errors: [...prev.errors, 'Sync process failed']
      }));

      toast({
        title: "Sync Failed",
        description: "Unable to complete sync. Will retry automatically.",
        variant: "destructive"
      });
    }
  };

  // Sync individual item
  const syncItem = async (item: OfflineData): Promise<boolean> => {
    try {
      let endpoint = '';
      let method = 'POST';

      switch (item.type) {
        case 'check-in':
          endpoint = '/api/check-ins';
          break;
        case 'photo':
          endpoint = '/api/photos';
          break;
        case 'testimonial':
          endpoint = '/api/testimonials';
          break;
        case 'note':
          endpoint = '/api/notes';
          break;
        default:
          throw new Error(`Unknown item type: ${item.type}`);
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(item.data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(`Failed to sync ${item.type}:`, error);
      return false;
    }
  };

  // Manual sync trigger
  const triggerManualSync = () => {
    if (syncStatus.isOnline) {
      syncData();
    } else {
      toast({
        title: "No Connection",
        description: "Cannot sync while offline. Connect to internet first.",
        variant: "destructive"
      });
    }
  };

  // Clear all offline data
  const clearOfflineData = () => {
    setOfflineQueue([]);
    localStorage.removeItem('rankitpro_offline_queue');
    setSyncStatus(prev => ({ ...prev, pendingCount: 0, errors: [] }));
    
    toast({
      title: "Offline Data Cleared",
      description: "All pending offline data has been removed.",
    });
  };

  // Cleanup
  const cleanup = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
  };

  // Get status badge color
  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'destructive';
    if (syncStatus.pendingCount > 0) return 'secondary';
    return 'default';
  };

  // Get connection icon
  const getConnectionIcon = () => {
    if (syncStatus.isSyncing) {
      return <Upload className="w-4 h-4 animate-pulse" />;
    }
    return syncStatus.isOnline ? 
      <Wifi className="w-4 h-4 text-green-600" /> : 
      <WifiOff className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getConnectionIcon()}
          <span className="font-medium">
            {syncStatus.isOnline ? 'Online' : 'Offline'}
          </span>
          {syncStatus.pendingCount > 0 && (
            <Badge variant={getStatusColor()}>
              {syncStatus.pendingCount} pending
            </Badge>
          )}
        </div>

        {syncStatus.lastSync && (
          <div className="text-xs text-gray-500">
            Last sync: {new Date(syncStatus.lastSync).toLocaleTimeString()}
          </div>
        )}
      </div>

      {syncStatus.isSyncing && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Syncing data...</span>
            <span>{syncStatus.syncProgress}%</span>
          </div>
          <Progress value={syncStatus.syncProgress} className="h-2" />
        </div>
      )}

      {syncStatus.errors.length > 0 && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            Sync Errors:
          </div>
          <ul className="mt-1 text-xs text-red-600">
            {syncStatus.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex space-x-2">
        <Button
          onClick={triggerManualSync}
          disabled={!syncStatus.isOnline || syncStatus.isSyncing || syncStatus.pendingCount === 0}
          variant="outline"
          size="sm"
        >
          {syncStatus.isSyncing ? (
            <Clock className="w-4 h-4 mr-2" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          Sync Now
        </Button>

        {syncStatus.pendingCount > 0 && (
          <Button
            onClick={clearOfflineData}
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50"
          >
            Clear Queue
          </Button>
        )}
      </div>

      {syncStatus.pendingCount > 0 && (
        <div className="mt-3 text-sm text-gray-600">
          {syncStatus.pendingCount} items waiting to sync when online
        </div>
      )}
    </div>
  );
};

// Export function to add data to offline queue (for use in other components)
export const useOfflineSync = () => {
  const addToQueue = (type: OfflineData['type'], data: any) => {
    // This would need to be connected to the OfflineSync component instance
    // For now, we'll save directly to localStorage
    try {
      const stored = localStorage.getItem('rankitpro_offline_queue');
      const existingData = stored ? JSON.parse(stored) : [];
      
      const offlineItem: OfflineData = {
        id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: Date.now(),
        retryCount: 0,
        size: JSON.stringify(data).length
      };

      const updatedQueue = [...existingData, offlineItem];
      localStorage.setItem('rankitpro_offline_queue', JSON.stringify(updatedQueue));
      
      return true;
    } catch (error) {
      console.error('Failed to add to offline queue:', error);
      return false;
    }
  };

  return { addToQueue };
};

export default OfflineSync;