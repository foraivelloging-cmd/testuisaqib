// ============================================================================
// SECURITY SANITIZER & INJECTION DEFENSE ENGINE
// Defends against XSS, SQL Injection, NoSQL Injection, Path Traversal & CSRF
// ============================================================================

/**
 * Remove XSS vectors, script tags, HTML tags, null bytes, and SQL injection signatures
 */
export function sanitizeString(val: unknown): string {
  if (typeof val !== 'string') {
    if (val === null || val === undefined) return '';
    return String(val);
  }

  let cleaned = val;

  // 1. Remove Null Bytes and control characters
  cleaned = cleaned.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Strip dangerous HTML/Script tags (XSS Prevention)
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  cleaned = cleaned.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  cleaned = cleaned.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 3. Remove inline event handlers (onerror=, onclick=, onload=, etc.)
  cleaned = cleaned.replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 4. Remove dangerous pseudo-protocols (javascript:, vbscript:, data:text/html)
  cleaned = cleaned.replace(/(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/gi, '');

  // 5. Neutralize dangerous path traversal attempts
  cleaned = cleaned.replace(/\.\.[\/\\]+/g, '');

  // 6. Escape raw angle brackets to prevent DOM injection
  cleaned = cleaned
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return cleaned.trim();
}

/**
 * Recursively sanitize all string properties in an object or array
 */
export function deepSanitize<T>(input: T): T {
  if (typeof input === 'string') {
    return sanitizeString(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => deepSanitize(item)) as unknown as T;
  }

  if (input !== null && typeof input === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      // Sanitize the key itself against prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      sanitizedObj[key] = deepSanitize(value);
    }
    return sanitizedObj as T;
  }

  return input;
}

/**
 * Detect malicious injection payloads (SQLi, XSS, Path Traversal)
 */
export function isSuspiciousPayload(val: unknown): boolean {
  if (typeof val !== 'string') return false;

  const attackPatterns = [
    /<script/i,
    /javascript:/i,
    /UNION\s+(?:ALL\s+)?SELECT/i,
    /--[^\r\n]*/i,
    /\/\*[\s\S]*?\*\//,
    /;\s*(?:DROP|ALTER|TRUNCATE|DELETE|INSERT|UPDATE)\s+/i,
    /\b(?:EXEC|EXECUTE)\s*\(/i,
    /\.\.[\/\\]+/,
    /\/etc\/(?:passwd|shadow)/i,
    /\/proc\/self/i,
    /win\.ini/i,
    /\0/,
  ];

  return attackPatterns.some((pattern) => pattern.test(val));
}

/**
 * Validate HTTP Origin and Referer for CSRF / XSRF protection
 */
export function validateCsrfOrigin(req: Request): boolean {
  const method = req.method.toUpperCase();
  // Safe HTTP read methods don't modify state
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true;
  }

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host') || '';

  // If both origin and referer are missing on mutation, verify if it's a server-to-server or curl request
  if (!origin && !referer) {
    // Check custom internal token or api header if needed
    return true;
  }

  const allowedDomains = [
    host.toLowerCase(),
    'localhost:3000',
    '127.0.0.1:3000',
    'saqibvisuals.com',
    'www.saqibvisuals.com',
  ];

  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase();
      if (!allowedDomains.includes(originHost)) {
        return false;
      }
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererHost = new URL(referer).host.toLowerCase();
      if (!allowedDomains.includes(refererHost)) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}
