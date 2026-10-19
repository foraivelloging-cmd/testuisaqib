import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkApiRateLimit } from '@/src/lib/rateLimit';

// Blacklist of known automated penetration testing tools and vulnerability scanners
const SUSPICIOUS_USER_AGENTS = [
  'sqlmap',
  'nikto',
  'masscan',
  'dirbuster',
  'nmap',
  'acunetix',
  'havij',
  'zgrab',
  'gobuster',
  'wpscan',
];

// Exploit paths probed by automated Linux bots / scanners
const BLOCKED_PATH_PATTERNS = [
  /\/\.env/i,
  /\/\.git/i,
  /\/wp-login\.php/i,
  /\/wp-admin/i,
  /\/phpmyadmin/i,
  /\/xmlrpc\.php/i,
  /\/etc\/passwd/i,
  /\/proc\/self/i,
  /\.\.[\/\\]+/,
];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  // ==================== 1. BLOCK MALICIOUS SCANNER USER-AGENTS ====================
  if (SUSPICIOUS_USER_AGENTS.some((agent) => userAgent.includes(agent))) {
    return new NextResponse(
      JSON.stringify({ error: 'Access Denied: Malicious scanner signature detected.' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // ==================== 2. BLOCK PATH TRAVERSAL & PROBING ====================
  let decodedPath = `${pathname}${search}`;
  try {
    decodedPath = decodeURIComponent(decodedPath);
  } catch {}

  if (BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(decodedPath) || pattern.test(request.url))) {
    return new NextResponse(
      JSON.stringify({ error: 'Access Denied: Forbidden request pattern.' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // ==================== 3. API RATE LIMITING & ANTI-CSRF ====================
  if (pathname.startsWith('/api/')) {
    // 3a. Rate Limiting (120 req / minute per IP)
    const rateCheck = checkApiRateLimit(clientIp, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests: Rate limit exceeded. Please try again shortly.',
          retryAfter: rateCheck.resetSeconds,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateCheck.resetSeconds),
          },
        }
      );
    }

    // 3b. Anti-CSRF / Anti-XSRF for mutation methods
    const method = request.method.toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');

      if (origin && host) {
        try {
          const originHost = new URL(origin).host.toLowerCase();
          const cleanHost = host.toLowerCase();

          // Reject if origin host does not match host header (excluding local dev)
          if (
            originHost !== cleanHost &&
            !originHost.includes('localhost') &&
            !originHost.includes('127.0.0.1')
          ) {
            return new NextResponse(
              JSON.stringify({ error: 'Forbidden: Cross-Site Request Origin Rejected.' }),
              {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }
        } catch {
          return new NextResponse(
            JSON.stringify({ error: 'Forbidden: Malformed Origin Header.' }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      }
    }
  }

  // ==================== 4. FORWARD REQUEST & ATTACH SECURITY HEADERS ====================
  const response = NextResponse.next();

  // Content Security Policy (Hardened against XSS & Clickjacking)
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.workers.dev https://api.wa.link",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('X-Download-Options', 'noopen');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - static asset extensions (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
