import { Metadata } from 'next';
import { getServerStoreData } from '@/src/lib/serverDataLoader';
import ClientStoreApp from '../ClientStoreApp';

export async function generateMetadata(): Promise<Metadata> {
  const { siteConfig } = await getServerStoreData();
  const origin = process.env.APP_URL || 'https://testuisaqib.vercel.app';
  const canonical = `${origin}/about`;
  const portrait = siteConfig.banner?.portraitUrl || 'https://ik.imagekit.io/mrsaqib/mrsaqib242-img25_7oG52NZUY.png';
  const brand = siteConfig.footer?.brandName || 'Muhammad Saqib Visuals Hub';

  return {
    title: `About Muhammad Saqib — Visuals Hub & Digital Agency`,
    description:
      `Learn about Muhammad Saqib, certified digital creator, AI tools supplier, SMM provider, and telecommunication data consultant in Pakistan.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `About Muhammad Saqib — Saqib Visuals`,
      description: `Official biography, credentials, and digital services offered by Muhammad Saqib.`,
      url: canonical,
      siteName: brand,
      images: [
        {
          url: portrait,
          width: 1200,
          height: 630,
          alt: `About Muhammad Saqib`,
        },
      ],
      type: 'website',
    },
  };
}

export default async function AboutPage() {
  const { services, webTools, siteConfig, reviews } = await getServerStoreData();

  return (
    <main className="min-h-screen">
      <ClientStoreApp
        initialServices={services}
        initialTools={webTools}
        initialConfig={siteConfig}
        initialReviews={reviews}
        initialTab="about"
      />
    </main>
  );
}
