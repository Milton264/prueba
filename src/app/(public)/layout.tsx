import { ContactBar } from '@/components/marketing/brand-sections';
import { PublicFooter } from '@/components/layout/public-footer';
import { PublicHeader } from '@/components/layout/public-header';
import { WhatsAppFab } from '@/components/whatsapp/whatsapp-fab';
import { getSettings } from '@/lib/supabase/queries';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings().catch(() => null);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <ContactBar whatsapp={settings?.whatsapp_number} email={settings?.contact_email} />
      <PublicFooter whatsapp={settings?.whatsapp_number} email={settings?.contact_email} />
      <WhatsAppFab number={settings?.whatsapp_number} />
    </div>
  );
}
