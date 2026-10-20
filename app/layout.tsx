import type { Metadata, Viewport } from 'next';
import '../src/index.css';
import { AntiScrapeProtectionShield } from '@/src/components/AntiScrapeProtectionShield';
import { AntiCloneSecurityKillswitch } from '@/src/components/AntiCloneSecurityKillswitch';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'https://mrsaqib242.vercel.app'),
  title: 'Muhammad Saqib | Saqib Visuals — SMM Store, CapCut, AI & SIM Info Hub',
  description: 'SMM Store, CapCut Pro, AI Tools & SIM Info Hub by Muhammad Saqib.',
  openGraph: {
    title: 'Muhammad Saqib | Saqib Visuals — SMM Store, CapCut, AI & SIM Info Hub',
    description: 'SMM Store, CapCut Pro, AI Tools & SIM Info Hub by Muhammad Saqib.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0e1220',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sonic-speed preconnect & dns-prefetch to zero out network latency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Instant LCP Priority Preload for Flagship Portrait Image */}
        <link
          rel="preload"
          as="image"
          href="https://ik.imagekit.io/mrsaqib/mrsaqib242-img25_7oG52NZUY.png"
          fetchPriority="high"
        />

        {/* 1. Core Default Fonts (Optimized & Non-blocking with display=swap) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* 2. Extended Font Packs */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=Fredoka:wght@600;700&family=Orbitron:wght@600;800&family=Outfit:wght@600;700&family=Playfair+Display:ital,wght@0,700;1,600&family=Poppins:wght@600;700&family=Quicksand:wght@600;700&family=Rajdhani:wght@600;700&family=Share+Tech+Mono&family=Space+Mono:wght@700&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />

        {/* Font Awesome Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning className="overflow-x-hidden antialiased selection:bg-pink-500 selection:text-white">
        <AntiCloneSecurityKillswitch />
        <AntiScrapeProtectionShield />
        {children}
      </body>
    </html>
  );
}
