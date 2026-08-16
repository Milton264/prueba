'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarRange, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';

export function ReportFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/admin/reportes?${next.toString()}`);
  };

  const preset = (days: number) => {
    const hasta = new Date().toISOString().slice(0, 10);
    const desde = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    router.push(`/admin/reportes?desde=${desde}&hasta=${hasta}`);
  };

  return (
    <div className="pes-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-navy-900">
        <CalendarRange className="h-4 w-4 text-navy-300" aria-hidden />
        Periodo
        {(params.get('desde') || params.get('hasta')) && (
          <Button variant="ghost" size="sm" className="ml-auto text-navy-500" onClick={() => router.push('/admin/reportes')}>
            <X className="h-3.5 w-3.5" aria-hidden />
            Limpiar
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Desde" htmlFor="desde">
          <Input id="desde" type="date" value={params.get('desde') ?? ''} onChange={(e) => set('desde', e.target.value)} />
        </Field>
        <Field label="Hasta" htmlFor="hasta">
          <Input id="hasta" type="date" value={params.get('hasta') ?? ''} onChange={(e) => set('hasta', e.target.value)} />
        </Field>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => preset(30)}>Últimos 30 días</Button>
          <Button variant="secondary" size="sm" onClick={() => preset(90)}>Últimos 90 días</Button>
          <Button variant="secondary" size="sm" onClick={() => preset(365)}>Último año</Button>
        </div>
      </div>
    </div>
  );
}
