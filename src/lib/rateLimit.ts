/**
 * Simple in-memory rate limiter for password verification endpoints.
 * Limits attempts per key (typically IP + artifact ID) within a time window.
 *
 * Note: This is per-process and resets on restart. For production deployments
 * behind multiple instances, an external store (Redis, etc.) would be needed.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const attempts = new Map<string, RateLimitEntry>();

// Periodically clean up expired entries to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function cleanupExpired(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of attempts) {
    if (now >= entry.resetAt) {
      attempts.delete(key);
    }
  }
}

/**
 * Checks whether a request identified by `key` is within the rate limit.
 * @param key - Unique identifier for the rate limit bucket (e.g. "verify:<artifactId>:<ip>")
 * @param maxAttempts - Maximum allowed attempts within the window (default: 10)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns true if the request is allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 10,
  windowMs = 60000,
): boolean {
  cleanupExpired();

  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now >= entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxAttempts) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Returns the number of seconds until the rate limit resets for the given key.
 * Returns 0 if the key is not rate limited.
 */
export function getRateLimitRetryAfter(key: string): number {
  const entry = attempts.get(key);
  if (!entry) return 0;

  const now = Date.now();
  if (now >= entry.resetAt) return 0;

  return Math.ceil((entry.resetAt - now) / 1000);
}
