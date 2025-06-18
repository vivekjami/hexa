'use client';

import React from 'react';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { emergencyStorageClear } from '@/lib/storage/emergency';
import { cleanupLocalStorage, getStorageStats } from '@/lib/storage';

interface StorageWarningProps {
  onDismiss?: () => void;
}

const StorageWarning: React.FC<StorageWarningProps> = ({ onDismiss }) => {
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    setStats(getStorageStats());
  }, []);

  const handleCleanup = () => {
    cleanupLocalStorage();
    setStats(getStorageStats());
    if (onDismiss) onDismiss();
  };

  const handleEmergencyClear = () => {
    if (window.confirm('This will clear all HEXA data including search history and sessions. Continue?')) {
      emergencyStorageClear();
    }
  };

  if (!stats || stats.usage < 0.8) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-800">Storage Warning</h3>
          <p className="text-sm text-yellow-700 mt-1">
            Your browser storage is {Math.round(stats.usage * 100)}% full ({stats.sizeKB}KB used). 
            This may cause errors when saving new data.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleCleanup}
              className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded hover:bg-yellow-200 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Smart Cleanup
            </button>
            <button
              onClick={handleEmergencyClear}
              className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Clear All Data
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded hover:bg-gray-200 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageWarning;
