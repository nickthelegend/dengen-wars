interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttl: number = 30000): void { // 30 seconds default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

export const apiCache = new SimpleCache()

// Rate limiting utility
class RateLimiter {
  private requests = new Map<string, number[]>()

  isAllowed(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now()
    const windowStart = now - windowMs

    if (!this.requests.has(key)) {
      this.requests.set(key, [])
    }

    const timestamps = this.requests.get(key)!
    // Remove old timestamps
    const validTimestamps = timestamps.filter(ts => ts > windowStart)
    this.requests.set(key, validTimestamps)

    if (validTimestamps.length < maxRequests) {
      validTimestamps.push(now)
      return true
    }

    return false
  }
}

export const rateLimiter = new RateLimiter()