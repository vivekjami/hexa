// Rate limiting utilities for API protection
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  // Check if request is allowed
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Reset window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  // Get remaining requests
  getRemaining(identifier: string): number {
    const entry = this.requests.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }

  // Get reset time
  getResetTime(identifier: string): number {
    const entry = this.requests.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return Date.now() + this.windowMs;
    }
    return entry.resetTime;
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [identifier, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(identifier);
      }
    }
  }

  // Reset specific identifier
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  // Get stats
  getStats() {
    return {
      activeIdentifiers: this.requests.size,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs,
      entries: Array.from(this.requests.entries()).map(([id, entry]) => ({
        identifier: id,
        count: entry.count,
        remaining: this.maxRequests - entry.count,
        resetTime: entry.resetTime,
        expired: Date.now() > entry.resetTime
      }))
    };
  }
}

// Rate limiting configurations
export const RateLimitConfigs = {
  // API endpoint limits
  SEARCH_API: { maxRequests: 50, windowMs: 60 * 1000 },      // 50 per minute
  CITATIONS_API: { maxRequests: 30, windowMs: 60 * 1000 },   // 30 per minute
  VERIFICATION_API: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 per minute
  REPORT_API: { maxRequests: 10, windowMs: 60 * 1000 },      // 10 per minute
  DISCOVERY_API: { maxRequests: 15, windowMs: 60 * 1000 },   // 15 per minute
  
  // User action limits
  USER_SEARCHES: { maxRequests: 100, windowMs: 60 * 1000 },  // 100 per minute
  USER_EXPORTS: { maxRequests: 10, windowMs: 60 * 1000 },    // 10 per minute
  USER_SAVES: { maxRequests: 50, windowMs: 60 * 1000 },      // 50 per minute
};

// Global rate limiters
export const rateLimiters = {
  searchApi: new RateLimiter(
    RateLimitConfigs.SEARCH_API.maxRequests,
    RateLimitConfigs.SEARCH_API.windowMs
  ),
  citationsApi: new RateLimiter(
    RateLimitConfigs.CITATIONS_API.maxRequests,
    RateLimitConfigs.CITATIONS_API.windowMs
  ),
  verificationApi: new RateLimiter(
    RateLimitConfigs.VERIFICATION_API.maxRequests,
    RateLimitConfigs.VERIFICATION_API.windowMs
  ),
  reportApi: new RateLimiter(
    RateLimitConfigs.REPORT_API.maxRequests,
    RateLimitConfigs.REPORT_API.windowMs
  ),
  discoveryApi: new RateLimiter(
    RateLimitConfigs.DISCOVERY_API.maxRequests,
    RateLimitConfigs.DISCOVERY_API.windowMs
  ),
  userSearches: new RateLimiter(
    RateLimitConfigs.USER_SEARCHES.maxRequests,
    RateLimitConfigs.USER_SEARCHES.windowMs
  ),
  userExports: new RateLimiter(
    RateLimitConfigs.USER_EXPORTS.maxRequests,
    RateLimitConfigs.USER_EXPORTS.windowMs
  ),
  userSaves: new RateLimiter(
    RateLimitConfigs.USER_SAVES.maxRequests,
    RateLimitConfigs.USER_SAVES.windowMs
  )
};

// Utility functions
export const getRateLimitHeaders = (limiter: RateLimiter, identifier: string) => {
  return {
    'X-RateLimit-Limit': limiter['maxRequests'].toString(),
    'X-RateLimit-Remaining': limiter.getRemaining(identifier).toString(),
    'X-RateLimit-Reset': Math.ceil(limiter.getResetTime(identifier) / 1000).toString()
  };
};

export const createRateLimitError = (identifier: string, limiter: RateLimiter) => {
  const resetTime = limiter.getResetTime(identifier);
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  
  return {
    error: 'Rate limit exceeded',
    retryAfter,
    resetTime: new Date(resetTime).toISOString()
  };
};

// Setup automatic cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    Object.values(rateLimiters).forEach(limiter => limiter.cleanup());
  }, 5 * 60 * 1000); // Cleanup every 5 minutes
}

export { RateLimiter };
