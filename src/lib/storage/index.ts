// Safe localStorage utilities with quota management

interface StorageConfig {
  maxSize: number; // Maximum size in bytes (estimated)
  maxItems: number; // Maximum number of items
  cleanupThreshold: number; // Percentage at which to trigger cleanup
}

const DEFAULT_CONFIG: StorageConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  maxItems: 50,
  cleanupThreshold: 0.8 // 80%
};

// Estimate localStorage usage
function getStorageSize(): number {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}

// Clean up old entries from an array-based storage
function cleanupArrayStorage(key: string, maxItems: number) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(data) && data.length > maxItems) {
      // Keep the most recent items
      const cleaned = data.slice(-maxItems);
      localStorage.setItem(key, JSON.stringify(cleaned));
      console.log(`Cleaned up ${key}: reduced from ${data.length} to ${cleaned.length} items`);
    }
  } catch (error) {
    console.warn(`Failed to cleanup ${key}:`, error);
    localStorage.removeItem(key);
  }
}

// Safe localStorage setter with automatic cleanup
export function safeLocalStorageSet(key: string, value: any, config: Partial<StorageConfig> = {}) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    const serializedValue = JSON.stringify(value);
    
    // Check if this write would exceed quota
    const currentSize = getStorageSize();
    const newItemSize = serializedValue.length + key.length;
    
    if (currentSize + newItemSize > fullConfig.maxSize * fullConfig.cleanupThreshold) {
      console.log('Storage approaching limit, triggering cleanup...');
      
      // Cleanup specific known large keys
      const largeKeys = ['hexa-research-sessions', 'hexa-search-history', 'hexa-research-templates'];
      largeKeys.forEach(largeKey => {
        if (largeKey !== key) { // Don't clean the key we're trying to set
          cleanupArrayStorage(largeKey, Math.floor(fullConfig.maxItems * 0.6)); // Keep 60% of max
        }
      });
    }
    
    localStorage.setItem(key, serializedValue);
    
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded, performing emergency cleanup...');
      
      // Emergency cleanup: remove old entries more aggressively
      try {
        cleanupArrayStorage('hexa-research-sessions', 10);
        cleanupArrayStorage('hexa-search-history', 20);
        cleanupArrayStorage('hexa-research-templates', 5);
        
        // Try setting again after cleanup
        localStorage.setItem(key, JSON.stringify(value));
      } catch (secondError) {
        console.error('Failed to save after cleanup:', secondError);
        // As last resort, clear the specific key and try again
        localStorage.removeItem(key);
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (thirdError) {
          console.error('Critical localStorage failure:', thirdError);
        }
      }
    } else {
      console.error('LocalStorage error:', error);
    }
  }
}

// Safe localStorage getter
export function safeLocalStorageGet(key: string, defaultValue: any = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Failed to parse localStorage key "${key}":`, error);
    return defaultValue;
  }
}

// Manual cleanup function
export function cleanupLocalStorage() {
  try {
    const currentSize = getStorageSize();
    console.log(`Current localStorage size: ${Math.round(currentSize / 1024)}KB`);
    
    // Clean up each major storage key
    cleanupArrayStorage('hexa-research-sessions', 20);
    cleanupArrayStorage('hexa-search-history', 30);
    cleanupArrayStorage('hexa-research-templates', 10);
    
    const newSize = getStorageSize();
    console.log(`After cleanup localStorage size: ${Math.round(newSize / 1024)}KB`);
    
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// Get storage statistics
export function getStorageStats() {
  const size = getStorageSize();
  const items = Object.keys(localStorage).length;
  
  return {
    size,
    sizeKB: Math.round(size / 1024),
    items,
    usage: size / (DEFAULT_CONFIG.maxSize),
    keys: Object.keys(localStorage).map(key => ({
      key,
      size: localStorage[key].length + key.length,
      sizeKB: Math.round((localStorage[key].length + key.length) / 1024)
    })).sort((a, b) => b.size - a.size)
  };
}

// Initialize cleanup interval
if (typeof window !== 'undefined') {
  // Check storage usage every 5 minutes
  setInterval(() => {
    const stats = getStorageStats();
    if (stats.usage > DEFAULT_CONFIG.cleanupThreshold) {
      console.log('Automatic storage cleanup triggered');
      cleanupLocalStorage();
    }
  }, 5 * 60 * 1000);
}
