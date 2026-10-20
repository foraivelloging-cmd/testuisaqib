'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Lightweight fast SHA-256 / Murmur-style hash for canvas & hardware data
function fastHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return hex;
}

// Generate high-entropy Canvas Fingerprint
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial", sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Saqib Visuals Hub 2026 🚀', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Saqib Visuals Hub 2026 🚀', 4, 17);

    return fastHash(canvas.toDataURL());
  } catch {
    return 'canvas-err';
  }
}

// Extract WebGL GPU Renderer info
function getWebGLRenderer(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return 'No WebGL';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'Generic WebGL';
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return renderer ? String(renderer).slice(0, 45) : 'WebGL Standard';
  } catch {
    return 'WebGL Unavail';
  }
}

export function VisitorTelemetryTracker() {
  const pathname = usePathname();
  const hasTrackedRoute = useRef<string | null>(null);

  useEffect(() => {
    // Avoid double firing for the same path in current session
    if (hasTrackedRoute.current === pathname) return;
    hasTrackedRoute.current = pathname;

    // Run in idle callback so tracking NEVER blocks critical rendering or interaction
    const runTracking = async () => {
      try {
        // 1. Get or Generate Persistent Device Fingerprint
        let deviceFp = localStorage.getItem('saqib_device_fp');
        if (!deviceFp) {
          const canvasHash = getCanvasFingerprint();
          const gpuInfo = getWebGLRenderer();
          const screenSpecs = `${window.screen.width}x${window.screen.height}@${window.screen.colorDepth || 24}`;
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
          const cores = navigator.hardwareConcurrency || 4;
          const lang = navigator.language || 'en';
          const platform = navigator.platform || 'Unknown';

          const combinedEntropy = `${canvasHash}|${gpuInfo}|${screenSpecs}|${timezone}|${cores}|${lang}|${platform}`;
          const hashHex1 = fastHash(combinedEntropy);
          const hashHex2 = fastHash(combinedEntropy.split('').reverse().join(''));
          const hashHex3 = fastHash(`${navigator.userAgent}|${canvasHash}`);

          deviceFp = `DEV-${hashHex1.slice(0, 4)}-${hashHex2.slice(0, 4)}-${hashHex3.slice(0, 4)}`.toUpperCase();
          localStorage.setItem('saqib_device_fp', deviceFp);
        }

        // 2. Battery Telemetry (Chrome, Edge, Opera, Android)
        let batteryLevel: number | null = null;
        let batteryCharging: boolean | null = null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nav = navigator as any;
        if (typeof nav.getBattery === 'function') {
          try {
            const battery = await nav.getBattery();
            batteryLevel = Math.round(battery.level * 100);
            batteryCharging = Boolean(battery.charging);
          } catch {
            // Battery API blocked or restricted
          }
        }

        // 3. Hardware & Screen Specifications
        const screenResolution = `${window.screen.width}x${window.screen.height} (${window.devicePixelRatio || 1}x)`;
        const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : '';
        const ram = nav.deviceMemory ? `${nav.deviceMemory}GB RAM` : '';
        const gpu = getWebGLRenderer();
        const hardwareSpecs = [cores, ram, gpu].filter(Boolean).join(' • ');

        // 4. Send telemetry beacon to backend
        const payload = {
          fingerprint: deviceFp,
          batteryLevel,
          batteryCharging,
          screenResolution,
          hardwareSpecs,
          language: navigator.language || 'en',
          currentPath: pathname || '/',
        };

        if (typeof navigator.sendBeacon === 'function' && !batteryLevel) {
          // If no battery promise pending, sendBeacon is fastest
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          navigator.sendBeacon('/api/analytics/visitor-telemetry', blob);
        } else {
          fetch('/api/analytics/visitor-telemetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Silently catch all exceptions so user experience is never affected
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => runTracking(), { timeout: 3000 });
    } else {
      setTimeout(runTracking, 1500);
    }
  }, [pathname]);

  return null;
}

export default VisitorTelemetryTracker;
