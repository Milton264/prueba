'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PlusCircle,
  ReceiptText,
  Settings,
  User,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { signOut } from '@/lib/actions/auth';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * Los iconos se referencian por NOMBRE (string), no por componente. Así el
 * array de navegación puede construirse en un Server Component (los layouts) y
 * pasarse a este Client Component sin romper la serialización: en Next no se
 * pueden pasar funciones/componentes de servidor a cliente. El nombre se
 * resuelve aquí contra este mapa.
 */
export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  nueva: PlusCircle,
  solicitudes: FileText,
  cotizaciones: ReceiptText,
  perfil: User,
  ayuda: HelpCircle,
  clipboard: ClipboardList,
  clientes: Users,
  servicios: Package,
  reportes: BarChart3,
  configuracion: Settings,
} satisfies Record<string, LucideIcon>;

export type NavIconName = keyof typeof NAV_ICONS;

export interface NavItem {
  href: string;
  label: string;
  icon: NavIconName;
  exact?: boolean;
}

interface SidebarProps {
  items: NavItem[];
  user: { name: string; email: string; role?: string };
  title?: string;
  /** 'client' = franja navy sólida (prototipo del cliente); 'admin' = ítem activo dorado tenue (prototipo del admin). */
  variant?: 'client' | 'admin';
}

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Navegacion lateral sobre blanco. Según los prototipos:
 * - Cliente: el item activo se marca con una franja navy sólida de ancho
 *   completo y texto blanco (ícono dorado).
 * - Admin: el item activo se marca con relleno dorado tenue, barra dorada a la
 *   izquierda y texto navy.
 */
function NavLinks({
  items,
  variant = 'client',
  onNavigate,
}: {
  items: NavItem[];
  variant?: 'client' | 'admin';
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const dark = variant === 'admin'; // Admin: barra lateral navy completa.

  return (
    <nav className={cn('flex-1 overflow-y-auto py-3', dark ? 'px-3' : 'px-2')}>
      {items.map((item) => {
        const active = isActive(pathname, item);
        const Icon = NAV_ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-[background-color,color,transform] duration-200 ease-out hover:translate-x-0.5',
              dark
                ? active
                  ? 'bg-white/10 font-semibold text-white'
                  : 'font-medium text-navy-200 hover:bg-white/5 hover:text-white'
                : active
                  ? 'bg-navy-900 font-semibold text-white'
                  : 'font-medium text-navy-600 hover:bg-mist hover:text-navy-900',
            )}
          >
            {active && dark && (
              <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-gold-400" aria-hidden />
            )}
            <Icon
              className={cn(
                'icon-response h-[18px] w-[18px] shrink-0',
                dark
                  ? active
                    ? 'text-gold-400'
                    : 'text-navy-300'
                  : active
                    ? 'text-gold-400'
                    : 'text-navy-300',
              )}
              aria-hidden
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function UserBlock({ user, dark = false }: { user: SidebarProps['user']; dark?: boolean }) {
  return (
    <div className={cn('p-3', dark ? 'border-t border-white/10' : 'border-t border-navy-100')}>
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-400 font-sans text-[10px] font-medium text-navy-900">
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-sm font-medium', dark ? 'text-white' : 'text-navy-900')}>{user.name}</p>
          <p className={cn('truncate font-sans text-[10px]', dark ? 'text-navy-300' : 'text-navy-400')}>{user.email}</p>
        </div>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className={cn(
            'mt-0.5 flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-[background-color,color,transform] duration-200 hover:translate-x-0.5',
            dark
              ? 'text-navy-200 hover:bg-white/5 hover:text-white'
              : 'text-navy-600 hover:bg-mist hover:text-navy-900',
          )}
        >
          <LogOut className={cn('icon-response h-[18px] w-[18px] shrink-0', dark ? 'text-navy-300' : 'text-navy-300')} aria-hidden />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}

export function Sidebar({ items, user, title, variant = 'client' }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const dark = variant === 'admin';

  return (
    <>
      {/* Barra superior movil */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-navy-100 bg-white px-4 lg:hidden">
        <Logo height={30} href="/" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-md text-navy-700 transition-[transform,background-color] duration-200 hover:bg-mist active:scale-95"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Cajón móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-navy-900/30 backdrop-blur-[2px]" onClick={() => setOpen(false)} aria-hidden />
          <aside className={cn('relative flex h-full w-[280px] animate-drawer-in flex-col shadow-2xl shadow-navy-950/20', dark ? 'bg-navy-950' : 'bg-white')}>
            <div className={cn('flex h-16 items-center justify-between px-4', dark ? 'border-b border-white/10' : 'border-b border-navy-100')}>
              <Logo height={30} href="/" variant={dark ? 'white' : 'primary'} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={cn('grid h-9 w-9 place-items-center transition-[transform,background-color,color] duration-200 hover:rotate-90', dark ? 'text-navy-200 hover:bg-white/10' : 'text-navy-700 hover:bg-mist')}
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks items={items} variant={variant} onNavigate={() => setOpen(false)} />
            <UserBlock user={user} dark={dark} />
          </aside>
        </div>
      )}

      {/* Sidebar de escritorio */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col lg:flex',
          dark ? 'bg-navy-950' : 'border-r border-navy-100 bg-white',
        )}
      >
        <div className={cn('flex h-[68px] shrink-0 items-center px-5', dark ? 'border-b border-white/10' : 'border-b border-navy-100')}>
          <Logo height={32} href="/" variant={dark ? 'white' : 'primary'} />
        </div>
        {title && (
          <p
            className={cn(
              'px-4 pb-3 pt-4 font-sans text-[10px] font-medium uppercase tracking-eyebrow',
              dark ? 'border-b border-white/10 text-navy-300' : 'border-b border-navy-100 text-navy-400',
            )}
          >
            {title}
          </p>
        )}
        <NavLinks items={items} variant={variant} />
        <UserBlock user={user} dark={dark} />
      </aside>
    </>
  );
}
