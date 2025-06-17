// Caching strategies for improved performance
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        expired: Date.now() > entry.expiresAt
      }))
    };
  }
}

// Global cache instance
export const memoryCache = new MemoryCache();

// Cache key generators
export const CacheKeys = {
  search: (query: string, options?: any) => 
    `search:${query}:${JSON.stringify(options || {})}`,
  
  citations: (url: string) => 
    `citations:${url}`,
  
  verification: (claim: string) => 
    `verification:${claim}`,
  
  knowledgeGraph: (entities: string[]) => 
    `knowledge-graph:${entities.sort().join(',')}`,
  
  report: (researchId: string) => 
    `report:${researchId}`,
  
  discovery: (query: string, depth: number) => 
    `discovery:${query}:${depth}`
};

// Cache TTL constants (in milliseconds)
export const CacheTTL = {
  SEARCH_RESULTS: 10 * 60 * 1000,      // 10 minutes
  CITATIONS: 30 * 60 * 1000,           // 30 minutes
  VERIFICATION: 15 * 60 * 1000,        // 15 minutes
  KNOWLEDGE_GRAPH: 20 * 60 * 1000,     // 20 minutes
  REPORT: 60 * 60 * 1000,              // 1 hour
  DISCOVERY: 5 * 60 * 1000             // 5 minutes
};

// Setup automatic cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup();
  }, 5 * 60 * 1000); // Cleanup every 5 minutes
}
