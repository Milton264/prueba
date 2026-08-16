'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { REQUEST_STATUS_LABELS } from '@/lib/status';
import { SERVICE_LABELS } from '@/lib/constants';

/** Filtros del panel administrativo: estado, servicio, fecha, cliente, urgencia. */
export function RequestFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    router.push(`/admin/solicitudes?${next.toString()}`);
  };

  const hasFilters = ['estado', 'servicio', 'desde', 'hasta', 'q', 'urgencia'].some((k) => params.get(k));

  return (
    <div className="pes-card mb-5 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-navy-900">
        <Filter className="h-4 w-4 text-navy-300" aria-hidden />
        Filtros
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-navy-500"
            onClick={() => router.push('/admin/solicitudes')}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Input
          placeholder="Cliente, empresa o número"
          defaultValue={params.get('q') ?? ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') set('q', (e.target as HTMLInputElement).value);
          }}
          onBlur={(e) => set('q', e.target.value)}
          className="xl:col-span-2"
          aria-label="Buscar"
        />

        <Select value={params.get('estado') ?? ''} onChange={(e) => set('estado', e.target.value)} aria-label="Estado">
          <option value="">Todos los estados</option>
          {Object.entries(REQUEST_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>

        <Select value={params.get('servicio') ?? ''} onChange={(e) => set('servicio', e.target.value)} aria-label="Servicio">
          <option value="">Todos los servicios</option>
          {Object.entries(SERVICE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>

        <Select value={params.get('urgencia') ?? ''} onChange={(e) => set('urgencia', e.target.value)} aria-label="Urgencia">
          <option value="">Normal y urgente</option>
          <option value="normal">Solo normal</option>
          <option value="urgente">Solo urgente</option>
        </Select>

        <div className="flex gap-2">
          <Input
            type="date"
            value={params.get('desde') ?? ''}
            onChange={(e) => set('desde', e.target.value)}
            aria-label="Desde"
          />
          <Input
            type="date"
            value={params.get('hasta') ?? ''}
            onChange={(e) => set('hasta', e.target.value)}
            aria-label="Hasta"
          />
        </div>
      </div>
    </div>
  );
}
