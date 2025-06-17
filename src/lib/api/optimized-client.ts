// Optimized API client with caching and rate limiting
import { memoryCache, CacheKeys, CacheTTL } from '../cache';
import { rateLimiters, createRateLimitError } from '../rateLimit';

interface APIRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  rateLimiter?: keyof typeof rateLimiters;
  identifier?: string;
}

class OptimizedAPIClient {
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  async request<T>(
    endpoint: string,
    options: APIRequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      cache = true,
      cacheKey,
      cacheTTL,
      rateLimiter,
      identifier = 'default'
    } = options;

    // Check rate limit
    if (rateLimiter && rateLimiters[rateLimiter]) {
      const limiter = rateLimiters[rateLimiter];
      if (!limiter.isAllowed(identifier)) {
        throw new Error(JSON.stringify(createRateLimitError(identifier, limiter)));
      }
    }

    // Check cache for GET requests
    if (method === 'GET' && cache && cacheKey) {
      const cachedData = memoryCache.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Make the request
    const url = `${this.baseURL}${endpoint}`;
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: T = await response.json();

      // Cache successful GET responses
      if (method === 'GET' && cache && cacheKey) {
        memoryCache.set(cacheKey, data, cacheTTL);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Optimized search with caching and rate limiting
  async search(query: string, options: any = {}) {
    const cacheKey = CacheKeys.search(query, options);
    
    return this.request('/search', {
      method: 'POST',
      body: { query, ...options },
      cache: true,
      cacheKey,
      cacheTTL: CacheTTL.SEARCH_RESULTS,
      rateLimiter: 'searchApi',
      identifier: `search-${Date.now()}`
    });
  }

  // Optimized citations with caching
  async getCitations(url: string) {
    const cacheKey = CacheKeys.citations(url);
    
    return this.request('/citations', {
      method: 'POST',
      body: { url },
      cache: true,
      cacheKey,
      cacheTTL: CacheTTL.CITATIONS,
      rateLimiter: 'citationsApi',
      identifier: `citations-${url}`
    });
  }

  // Optimized verification with caching
  async verifyFact(claim: string) {
    const cacheKey = CacheKeys.verification(claim);
    
    return this.request('/verification', {
      method: 'POST',
      body: { claim },
      cache: true,
      cacheKey,
      cacheTTL: CacheTTL.VERIFICATION,
      rateLimiter: 'verificationApi',
      identifier: `verification-${claim.slice(0, 50)}`
    });
  }

  // Optimized knowledge graph with caching
  async getKnowledgeGraph(entities: string[]) {
    const cacheKey = CacheKeys.knowledgeGraph(entities);
    
    return this.request('/knowledge-graph', {
      method: 'POST',
      body: { entities },
      cache: true,
      cacheKey,
      cacheTTL: CacheTTL.KNOWLEDGE_GRAPH,
      rateLimiter: 'searchApi',
      identifier: `knowledge-graph-${entities.join(',').slice(0, 50)}`
    });
  }

  // Optimized report generation
  async generateReport(researchData: any) {
    const researchId = this.generateResearchId(researchData);
    const cacheKey = CacheKeys.report(researchId);
    
    return this.request('/report-generation', {
      method: 'POST',
      body: researchData,
      cache: true,
      cacheKey,
      cacheTTL: CacheTTL.REPORT,
      rateLimiter: 'reportApi',
      identifier: `report-${researchId}`
    });
  }

  // Optimized discovery with caching
  async performDiscovery(query: string, depth: number = 2) {
    const cacheKey = CacheKeys.discovery(query, depth);
    
    return this.request('/discovery', {
      method: 'POST',
      body: { query, depth },
      cache: true,
      cacheKey,
      cacheTTL: CacheTTL.DISCOVERY,
      rateLimiter: 'discoveryApi',
      identifier: `discovery-${query.slice(0, 50)}`
    });
  }

  // Batch requests with intelligent caching
  async batchRequest<T>(requests: Array<{
    endpoint: string;
    options?: APIRequestOptions;
    priority?: number;
  }>): Promise<T[]> {
    // Sort by priority (higher numbers first)
    const sortedRequests = requests.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // Execute requests with concurrency limit
    const concurrencyLimit = 5;
    const results: T[] = [];
    
    for (let i = 0; i < sortedRequests.length; i += concurrencyLimit) {
      const batch = sortedRequests.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map(req => 
        this.request<T>(req.endpoint, req.options).catch(error => {
          console.error(`Batch request failed for ${req.endpoint}:`, error);
          return null;
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null));
    }
    
    return results;
  }

  // Utility methods
  private generateResearchId(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  // Get cache statistics
  getCacheStats() {
    return memoryCache.getStats();
  }

  // Get rate limit statistics
  getRateLimitStats() {
    return Object.entries(rateLimiters).reduce((stats, [key, limiter]) => {
      stats[key] = limiter.getStats();
      return stats;
    }, {} as Record<string, any>);
  }

  // Clear cache
  clearCache() {
    memoryCache.clear();
  }

  // Reset rate limits
  resetRateLimits() {
    Object.values(rateLimiters).forEach(limiter => {
      limiter['requests'].clear();
    });
  }
}

// Global optimized API client instance
export const apiClient = new OptimizedAPIClient();

// Export for custom instances
export { OptimizedAPIClient };
