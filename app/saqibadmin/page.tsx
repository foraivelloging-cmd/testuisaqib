import { Metadata } from 'next';
import { getServerStoreData } from '@/src/lib/serverDataLoader';
import AdminPortalClient from './AdminPortalClient';

export const metadata: Metadata = {
  title: 'Saqib Visuals — Admin Security Vault',
  description: 'Cryptographically protected admin management portal.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SaqibAdminPage() {
  const serverData = await getServerStoreData();

  return (
    <AdminPortalClient
      initialServices={serverData.services}
      initialTools={serverData.webTools}
      initialConfig={serverData.siteConfig}
    />
  );
}
