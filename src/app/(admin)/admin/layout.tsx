import { redirect } from 'next/navigation';
import { Sidebar, type NavItem } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { getSessionUser } from '@/lib/supabase/queries';

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { href: '/admin/solicitudes', label: 'Solicitudes', icon: 'clipboard' },
  { href: '/admin/cotizaciones', label: 'Cotizaciones', icon: 'cotizaciones' },
  { href: '/admin/clientes', label: 'Clientes', icon: 'clientes' },
  { href: '/admin/servicios', label: 'Servicios', icon: 'servicios' },
  { href: '/admin/reportes', label: 'Reportes', icon: 'reportes' },
  { href: '/admin/configuracion', label: 'Configuración', icon: 'configuracion' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/iniciar-sesion?next=/admin');
  if (user.role !== 'admin') redirect('/portal');

  const identity = { name: user.full_name || 'PES Coordinación', email: user.email };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar items={NAV} title="Panel administrativo" user={identity} variant="admin" />
      <div className="lg:pl-[260px]">
        <Topbar items={NAV} user={identity} />
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
