// ============================================================================
// RATE LIMITING & BRUTE FORCE DEFENSE SYSTEM
// Dual-Layer Architecture: Fast In-Memory Cache + Persistent Supabase Database
// 3-Attempt Lockout Timer + Sliding Window API Rate Limiter
// ============================================================================

import { supabaseAdmin } from './supabaseAdmin';

interface LockoutRecord {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttemptAt: number;
}

interface ApiRateRecord {
  count: number;
  resetAt: number;
}

// In-Memory Global Stores (Persists during Node.js runtime)
const lockoutStore = new Map<string, LockoutRecord>();
const apiRateStore = new Map<string, ApiRateRecord>();

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 Minutes lockout
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 Minutes sliding attempt window

/**
 * Clean up stale records periodically to avoid memory growth
 */
function cleanupExpiredRecords() {
  const now = Date.now();
  for (const [key, record] of lockoutStore.entries()) {
    if (record.lockedUntil && record.lockedUntil < now) {
      lockoutStore.delete(key);
    } else if (!record.lockedUntil && now - record.lastAttemptAt > ATTEMPT_WINDOW_MS) {
      lockoutStore.delete(key);
    }
  }

  for (const [key, record] of apiRateStore.entries()) {
    if (record.resetAt < now) {
      apiRateStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredRecords, 5 * 60 * 1000);
}

// ==================== 1. ADMIN 3-ATTEMPT LOCKOUT ====================

export interface LockoutStatus {
  locked: boolean;
  remainingSeconds: number;
  attemptsLeft: number;
  totalAttempts: number;
}

/**
 * Check if the given identifier (IP / username) is currently locked out (In-Memory Check)
 */
export function checkAdminLockout(identifier: string): LockoutStatus {
  const now = Date.now();
  const record = lockoutStore.get(identifier);

  if (!record) {
    return {
      locked: false,
      remainingSeconds: 0,
      attemptsLeft: MAX_FAILED_ATTEMPTS,
      totalAttempts: 0,
    };
  }

  // Check if currently locked
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      locked: true,
      remainingSeconds,
      attemptsLeft: 0,
      totalAttempts: record.failedAttempts,
    };
  }

  // If lockout expired, reset
  if (record.lockedUntil && record.lockedUntil <= now) {
    lockoutStore.delete(identifier);
    return {
      locked: false,
      remainingSeconds: 0,
      attemptsLeft: MAX_FAILED_ATTEMPTS,
      totalAttempts: 0,
    };
  }

  // Check sliding window expiry for uncompleted lockouts
  if (now - record.lastAttemptAt > ATTEMPT_WINDOW_MS) {
    lockoutStore.delete(identifier);
    return {
      locked: false,
      remainingSeconds: 0,
      attemptsLeft: MAX_FAILED_ATTEMPTS,
      totalAttempts: 0,
    };
  }

  const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - record.failedAttempts);
  return {
    locked: false,
    remainingSeconds: 0,
    attemptsLeft,
    totalAttempts: record.failedAttempts,
  };
}

/**
 * Asynchronous Dual-Layer Check:
 * Checks memory first. If locked in memory, verifies Supabase to allow manual SQL unlock.
 * If not locked in memory, checks Supabase for persistent cross-instance locks.
 */
export async function checkAdminLockoutAsync(identifier: string): Promise<LockoutStatus> {
  const now = Date.now();
  const memStatus = checkAdminLockout(identifier);

  try {
    const { data, error } = await supabaseAdmin
      .from('security_lockouts')
      .select('identifier, failed_attempts, locked_until, last_attempt_at')
      .eq('identifier', identifier)
      .maybeSingle();

    if (error) {
      return memStatus; // Fallback to memory on DB error
    }

    // 1. If Memory thought it was locked, but row in Supabase was DELETED (Manual SQL Unlock by Admin):
    if (memStatus.locked && (!data || !data.locked_until || new Date(data.locked_until).getTime() <= now)) {
      lockoutStore.delete(identifier);
      return {
        locked: false,
        remainingSeconds: 0,
        attemptsLeft: MAX_FAILED_ATTEMPTS,
        totalAttempts: 0,
      };
    }

    // 2. If Supabase has an active lock (even if serverless instance just spun up):
    if (data && data.locked_until && new Date(data.locked_until).getTime() > now) {
      const lockedUntilMs = new Date(data.locked_until).getTime();
      const remainingSeconds = Math.ceil((lockedUntilMs - now) / 1000);

      // Keep memory synchronized
      lockoutStore.set(identifier, {
        failedAttempts: data.failed_attempts || MAX_FAILED_ATTEMPTS,
        lockedUntil: lockedUntilMs,
        lastAttemptAt: data.last_attempt_at ? new Date(data.last_attempt_at).getTime() : now,
      });

      return {
        locked: true,
        remainingSeconds,
        attemptsLeft: 0,
        totalAttempts: data.failed_attempts || MAX_FAILED_ATTEMPTS,
      };
    }
  } catch (err) {
    console.warn('[RateLimit] Supabase check fallback:', err);
  }

  return memStatus;
}

/**
 * Record a failed admin attempt (In-Memory + Supabase Database Sync)
 */
export function recordFailedAttempt(identifier: string): LockoutStatus {
  const now = Date.now();
  let record = lockoutStore.get(identifier);

  if (!record || (record.lockedUntil && record.lockedUntil <= now)) {
    record = {
      failedAttempts: 1,
      lockedUntil: null,
      lastAttemptAt: now,
    };
  } else {
    record.failedAttempts += 1;
    record.lastAttemptAt = now;
  }

  let locked = false;
  let remainingSeconds = 0;

  if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    locked = true;
    remainingSeconds = Math.ceil(LOCKOUT_DURATION_MS / 1000);
  }

  lockoutStore.set(identifier, record);

  // Background sync to Supabase table
  syncLockoutToSupabase(identifier, record).catch(() => {});

  return {
    locked,
    remainingSeconds,
    attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - record.failedAttempts),
    totalAttempts: record.failedAttempts,
  };
}

/**
 * Async version of recording failed attempt (guarantees DB write completion)
 */
export async function recordFailedAttemptAsync(identifier: string): Promise<LockoutStatus> {
  const status = recordFailedAttempt(identifier);
  const record = lockoutStore.get(identifier);
  if (record) {
    await syncLockoutToSupabase(identifier, record).catch(() => {});
  }
  return status;
}

/**
 * Helper to sync lock state to Supabase table public.security_lockouts
 */
async function syncLockoutToSupabase(identifier: string, record: LockoutRecord) {
  try {
    await supabaseAdmin.from('security_lockouts').upsert(
      {
        identifier,
        failed_attempts: record.failedAttempts,
        locked_until: record.lockedUntil ? new Date(record.lockedUntil).toISOString() : null,
        last_attempt_at: new Date(record.lastAttemptAt).toISOString(),
      },
      { onConflict: 'identifier' }
    );
  } catch (err) {
    console.warn('[RateLimit] Supabase syncLockout failed:', err);
  }
}

/**
 * Reset failed attempts upon successful authentication
 */
export function resetFailedAttempts(identifier: string): void {
  lockoutStore.delete(identifier);
  clearLockoutFromSupabase(identifier).catch(() => {});
}

/**
 * Async version of reset failed attempts (guarantees DB deletion completion)
 */
export async function resetFailedAttemptsAsync(identifier: string): Promise<void> {
  lockoutStore.delete(identifier);
  await clearLockoutFromSupabase(identifier).catch(() => {});
}

/**
 * Helper to remove lock entry from Supabase
 */
async function clearLockoutFromSupabase(identifier: string) {
  try {
    await supabaseAdmin.from('security_lockouts').delete().eq('identifier', identifier);
  } catch (err) {
    console.warn('[RateLimit] Supabase clearLockout failed:', err);
  }
}

// ==================== 2. GENERAL API SLIDING WINDOW RATE LIMITER ====================

export interface ApiRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

/**
 * Check and increment API rate limit for an IP
 * @param ip Client IP address
 * @param limit Maximum requests per window (default 120)
 * @param windowMs Time window in milliseconds (default 60,000ms = 1 min)
 */
export function checkApiRateLimit(
  ip: string,
  limit = 120,
  windowMs = 60 * 1000
): ApiRateLimitResult {
  const now = Date.now();
  let record = apiRateStore.get(ip);

  if (!record || record.resetAt <= now) {
    record = {
      count: 1,
      resetAt: now + windowMs,
    };
    apiRateStore.set(ip, record);
    return {
      allowed: true,
      remaining: limit - 1,
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const resetSeconds = Math.ceil((record.resetAt - now) / 1000);

  if (record.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetSeconds,
    };
  }

  return {
    allowed: true,
    remaining,
    resetSeconds,
  };
}
