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

// Blacklist of automated code-rippers, scrapers, and headless browser scrapers
const FORBIDDEN_SCRAPERS = [
  'curl',
  'wget',
  'python-requests',
  'python-urllib',
  'scrapy',
  'httrack',
  'beautifulsoup',
  'headlesschrome',
  'puppeteer',
  'selenium',
  'phantomjs',
  'postmanruntime',
  'insomnia',
  'apache-httpclient',
  'go-http-client',
  'okhttp',
  'aiohttp',
  'httpclient',
  'libwww-perl',
  'winhttp',
  'webcopier',
  'teleport',
  'offline explorer',
  'site-sniffer',
  'page-ripper',
  'superbot',
];

// Allowed legitimate search engine crawlers & social card bots
const ALLOWED_CRAWLERS = [
  'googlebot',
  'bingbot',
  'duckduckbot',
  'slurp',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'whatsapp',
  'telegrambot',
  'twitterbot',
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

  // ==================== 1. BOT, SCRAPER & SCANNER DEFENSE SHIELD ====================
  const isAllowedCrawler = ALLOWED_CRAWLERS.some((bot) => userAgent.includes(bot));

  if (!isAllowedCrawler) {
    // 1a. Block Malicious Penetration Scanners
    if (SUSPICIOUS_USER_AGENTS.some((agent) => userAgent.includes(agent))) {
      return new NextResponse(
        JSON.stringify({ error: 'Access Denied: Malicious scanner signature detected.' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 1b. Block Automated Code Scrapers & Headless Rippers
    const isScraper = FORBIDDEN_SCRAPERS.some((sig) => userAgent.includes(sig));
    const isEmptyUserAgent = !userAgent || userAgent.trim().length < 4;

    if (isScraper || isEmptyUserAgent) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({
            error: 'Access Denied: Automated source code scraping is strictly prohibited on Saqib Visuals Hub.',
            clientIp,
            status: 403,
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new NextResponse(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>403 Forbidden — Security Shield Active</title>
  <style>
    body { background: #090d16; color: #f1f5f9; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
    .card { background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(244, 63, 94, 0.4); border-radius: 20px; padding: 40px; max-width: 520px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); backdrop-filter: blur(20px); }
    h1 { color: #f43f5e; font-size: 26px; margin: 0 0 12px; font-weight: 900; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 0 0 20px; }
    .badge { display: inline-block; background: rgba(244, 63, 94, 0.15); color: #fb7185; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 800; margin-bottom: 20px; border: 1px solid rgba(244, 63, 94, 0.3); }
    .footer { font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🛡️ ANTI-SCRAPING ACTIVE SHIELD</div>
    <h1>403 Forbidden</h1>
    <p>Automated scrapers, headless rippers, and unauthorized bots are strictly prohibited on Muhammad Saqib Visuals Hub. Please visit using a standard, secure web browser.</p>
    <div class="footer">Client IP: ${clientIp} • Protected by Saqib Visuals Security</div>
  </div>
</body>
</html>`,
        {
          status: 403,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Robots-Tag': 'noindex, nofollow, noarchive',
          },
        }
      );
    }
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
