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
    
    // Show user notification
    window.alert('Storage cleared successfully. Please refresh the page.');
    
    // Refresh the page
    window.location.reload();
    
  } catch (error) {
    console.error('Emergency storage clear failed:', error);
    
    // Last resort: clear all localStorage
    try {
      localStorage.clear();
      window.location.reload();
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
        console.error('QuotaExceededError caught, triggering emergency cleanup');
        emergencyStorageClear();
      } else {
        throw error;
      }
    }
  };
}
