import { redirect } from 'next/navigation';
import { Sidebar, type NavItem } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { createClient } from '@/lib/supabase/server';
import { getMyClientProfile, getSessionUser } from '@/lib/supabase/queries';

const NAV: NavItem[] = [
  { href: '/portal', label: 'Resumen', icon: 'dashboard', exact: true },
  { href: '/portal/solicitudes/nueva', label: 'Nueva solicitud', icon: 'nueva', exact: true },
  { href: '/portal/solicitudes', label: 'Mis solicitudes', icon: 'solicitudes' },
  { href: '/portal/cotizaciones', label: 'Cotizaciones', icon: 'cotizaciones' },
  { href: '/portal/perfil', label: 'Perfil', icon: 'perfil' },
  { href: '/portal/ayuda', label: 'Ayuda', icon: 'ayuda' },
];

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/iniciar-sesion?next=/portal');
  if (user.role === 'admin') redirect('/admin');

  const profile = await getMyClientProfile();
  const supabase = await createClient();
  const { count: unread } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_user_id', user.id)
    .is('read_at', null);

  const identity = {
    name: profile?.full_name || user.full_name || 'Cliente',
    email: user.email,
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar items={NAV} title="Portal del cliente" user={identity} />
      <div className="lg:pl-[260px]">
        <Topbar items={NAV} user={identity} unread={unread ?? 0} />
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
