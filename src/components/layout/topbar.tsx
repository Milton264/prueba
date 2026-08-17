'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { NavItem } from './sidebar';

/**
 * Barra superior de las areas privadas.
 * El titulo se deriva de la ruta actual usando el mismo mapa de navegacion del
 * sidebar, de modo que ambas piezas nunca se desincronizan.
 * Las notificaciones se muestran como campana discreta, no como item de menu.
 */
export function Topbar({
  items,
  user,
  unread = 0,
  notificationHref,
}: {
  items: NavItem[];
  user: { name: string; email: string };
  unread?: number;
  notificationHref?: string;
}) {
  const pathname = usePathname();

  const match = [...items]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));

  return (
    <header className="sticky top-0 z-20 hidden h-[68px] items-center justify-between gap-4 border-b border-navy-100 bg-white px-6 lg:flex">
      <h1 className="truncate font-sans text-[12px] font-medium uppercase tracking-eyebrow text-navy-900">{match?.label ?? 'Panel'}</h1>

      <div className="flex items-center gap-3">
        <Link
          href={notificationHref ?? pathname}
          className="relative grid h-10 w-10 place-items-center rounded-lg text-navy-300 transition-[transform,background-color,color] duration-200 hover:-translate-y-px hover:bg-mist active:translate-y-0 hover:text-navy-700"
          aria-label={unread > 0 ? `${unread} notificaciones sin leer` : 'Notificaciones'}
        >
          <Bell className="h-5 w-5" aria-hidden />
          {unread > 0 && (
            <span
              className={cn(
                'absolute right-1.5 top-1.5 grid min-w-[16px] place-items-center bg-gold-400 px-1 font-sans text-[9px] font-medium tabular-nums text-navy-900',
              )}
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2.5 border-l border-navy-100 pl-3">
          <div className="text-right">
            <p className="text-[13px] font-medium leading-tight text-navy-900">
              <span className="text-navy-400">Bienvenido, </span>
              {user.name}
            </p>
            <p className="font-sans text-[10px] text-navy-400">{user.email}</p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-900 font-sans text-[10px] font-medium text-white">
            {initials(user.name)}
          </span>
        </div>
      </div>
    </header>
  );
}
