/**
 * SIMPLE RATE LIMITER
 * 
 * In-memory sliding window. Good enough for single-instance Vercel functions.
 * For multi-instance production, swap to Vercel KV or Upstash Redis.
 */

const windowMs = 60 * 60 * 1000; // 1 hour
const maxRequests = 5; // 5 roasts per hour per IP

// In-memory store (resets on cold start — that's fine for abuse prevention)
const hits = new Map();

/**
 * Check if a request should be rate-limited.
 * Returns { allowed: boolean, remaining: number, resetIn: number }
 */
export function checkRateLimit(ip) {
  const now = Date.now();
  const key = ip || 'unknown';

  // Clean old entries
  if (!hits.has(key)) {
    hits.set(key, []);
  }

  const timestamps = hits.get(key).filter(t => now - t < windowMs);
  hits.set(key, timestamps);

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0];
    const resetIn = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, resetIn };
  }

  timestamps.push(now);
  return { allowed: true, remaining: maxRequests - timestamps.length, resetIn: 0 };
}

/**
 * Get client IP from request headers (works on Vercel)
 */
export function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
