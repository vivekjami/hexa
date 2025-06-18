// Emergency localStorage management for quota errors

// Function to clear localStorage when quota is exceeded
export function emergencyStorageClear() {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear all HEXA-related storage
    const hexaKeys = Object.keys(localStorage).filter(key => key.startsWith('hexa-'));
    
    hexaKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('Emergency storage clear completed. Cleared keys:', hexaKeys);
    
    // Don't automatically refresh - let the user decide
    // Show user notification without forcing reload
    if (window.confirm('Browser storage was full and has been cleared to prevent errors. Would you like to refresh the page to start fresh?')) {
      window.location.reload();
    }
    
  } catch (error) {
    console.error('Emergency storage clear failed:', error);
    
    // Last resort: clear all localStorage
    try {
      localStorage.clear();
      if (window.confirm('Critical storage error occurred. Storage has been cleared. Refresh the page to continue?')) {
        window.location.reload();
      }
    } catch (clearError) {
      console.error('Critical: Could not clear localStorage:', clearError);
    }
  }
}

// Add to window object for easy access from console
if (typeof window !== 'undefined') {
  (window as any).emergencyStorageClear = emergencyStorageClear;
  (window as any).hexaDebug = {
    clearStorage: emergencyStorageClear,
    getStorageSize: () => {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    },
    listHexaKeys: () => {
      return Object.keys(localStorage).filter(key => key.startsWith('hexa-'));
    }
  };
}

// Window error handler for quota exceeded errors
if (typeof window !== 'undefined') {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key: string, value: string) {
    try {
      originalSetItem.call(this, key, value);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('QuotaExceededError caught, attempting smart cleanup first...');
        
        // Try smart cleanup first before emergency clear
        try {
          // Smart cleanup: remove old entries from known large keys
          const smartCleanup = () => {
            const keysToClean = ['hexa-research-sessions', 'hexa-search-history', 'hexa-research-templates'];
            keysToClean.forEach(keyName => {
              try {
                const data = JSON.parse(localStorage.getItem(keyName) || '[]');
                if (Array.isArray(data) && data.length > 5) {
                  // Keep only the 5 most recent items
                  const cleaned = data.slice(-5);
                  localStorage.setItem(keyName, JSON.stringify(cleaned));
                  console.log(`Smart cleanup: reduced ${keyName} from ${data.length} to ${cleaned.length} items`);
                }
              } catch (cleanupError) {
                console.warn(`Failed to cleanup ${keyName}:`, cleanupError);
                localStorage.removeItem(keyName);
              }
            });
          };
          
          smartCleanup();
          
          // Try the operation again after cleanup
          try {
            originalSetItem.call(this, key, value);
            console.log('Successfully saved after smart cleanup');
            return;
          } catch (retryError) {
            console.warn('Smart cleanup failed, performing emergency cleanup');
            emergencyStorageClear();
          }
        } catch (cleanupError) {
          console.error('Smart cleanup failed, performing emergency cleanup', cleanupError);
          emergencyStorageClear();
        }
      } else {
        throw error;
      }
    }
  };
}
