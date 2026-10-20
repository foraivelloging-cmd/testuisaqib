import { Metadata } from 'next';
import { getServerStoreData } from '@/src/lib/serverDataLoader';
import ClientStoreApp from '../ClientStoreApp';

export async function generateMetadata(): Promise<Metadata> {
  const { siteConfig } = await getServerStoreData();
  const origin = process.env.APP_URL || 'https://testuisaqib.vercel.app';
  const canonical = `${origin}/siminfo`;
  const portrait = siteConfig.banner?.portraitUrl || 'https://ik.imagekit.io/mrsaqib/mrsaqib242-img25_7oG52NZUY.png';
  const brand = siteConfig.footer?.brandName || 'Muhammad Saqib Visuals Hub';

  return {
    title: `SIM Info & Telecommunication Records Lookup | ${brand}`,
    description:
      `Franchise SIM ownership search, NADRA family tree verification, and telecommunication network lookup tools by Muhammad Saqib.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `SIM Info & Telecommunication Records — ${brand}`,
      description: `Official SIM Database & franchise network lookup service.`,
      url: canonical,
      siteName: brand,
      images: [
        {
          url: portrait,
          width: 1200,
          height: 630,
          alt: `SIM Info Records — ${brand}`,
        },
      ],
      type: 'website',
    },
  };
}

export default async function SimInfoPage() {
  const { services, webTools, siteConfig, reviews } = await getServerStoreData();

  return (
    <main className="min-h-screen">
      <ClientStoreApp
        initialServices={services}
        initialTools={webTools}
        initialConfig={siteConfig}
        initialReviews={reviews}
        initialTab="siminfo"
      />
    </main>
  );
}
