import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Droplets, Fuel, Mail, MapPin, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricRow } from '@/components/ui/stat-card';
import { DataRow, PageHeader } from '@/components/ui/misc';
import { Table, TableWrapper, Td, Th, Thead, Tr } from '@/components/ui/table';
import { WhatsAppButton } from '@/components/whatsapp/whatsapp-button';
import { FACILITY_LABELS, SERVICE_LABELS } from '@/lib/constants';
import { formatCurrency, formatDateShort, formatGallons, formatNumber, formatPhone } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import type { Address, ClientProfile, Quotation, ServiceRequest } from '@/types';

export const metadata: Metadata = { title: 'Ficha de cliente' };

export default async function ClienteDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase.from('client_profiles').select('*').eq('id', id).maybeSingle();
  if (!client) notFound();
  const c = client as ClientProfile;

  const [{ data: requests }, { data: addresses }] = await Promise.all([
    supabase
      .from('service_requests')
      .select('*, quotations(id, quotation_number, status, total)')
      .eq('client_profile_id', id)
      .order('created_at', { ascending: false }),
    supabase.from('addresses').select('*').eq('client_profile_id', id),
  ]);

  const list = (requests ?? []) as (ServiceRequest & { quotations: Quotation[] })[];

  // "Total cotizado aprobado": no existe facturación en esta versión.
  const totalApproved = list.reduce((sum, r) => {
    const approved = r.quotations?.find((q) => q.status === 'approved');
    return sum + (approved ? Number(approved.total) : 0);
  }, 0);

  const dieselGal = list
    .filter((r) => r.service_type === 'diesel')
    .reduce((s, r) => s + (r.final_quantity_gal ?? r.quantity_gal ?? 0), 0);
  const aguaGal = list
    .filter((r) => r.service_type === 'agua')
    .reduce((s, r) => s + (r.final_quantity_gal ?? r.quantity_gal ?? 0), 0);

  return (
    <div>
      <PageHeader
        title={c.full_name}
        description={c.company_name ?? 'Cliente sin empresa registrada'}
        backHref="/admin/clientes"
      >
        {!c.user_id && <Badge tone="neutral">Invitado sin cuenta</Badge>}
      </PageHeader>

      <MetricRow
        className="mb-8"
        metrics={[
          { label: 'Solicitudes', value: list.length },
          { label: 'Galones diésel', value: formatNumber(dieselGal) },
          { label: 'Galones agua', value: formatNumber(aguaGal) },
          { label: 'Cotizado aprobado', value: formatCurrency(totalApproved), accent: true },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Historial de solicitudes</CardTitle></CardHeader>
          {list.length === 0 ? (
            <EmptyState title="Sin solicitudes" description="Este cliente aún no ha enviado solicitudes." />
          ) : (
            <TableWrapper>
              <Table className="min-w-[760px]">
                <Thead>
                  <tr>
                    <Th>Número</Th>
                    <Th>Servicio</Th>
                    <Th>Cantidad</Th>
                    <Th>Cotización</Th>
                    <Th>Fecha</Th>
                    <Th>Estado</Th>
                    <Th className="text-right">Acción</Th>
                  </tr>
                </Thead>
                <tbody>
                  {list.map((r) => {
                    const q = r.quotations?.find((x) => x.status !== 'superseded');
                    return (
                      <Tr key={r.id}>
                        <Td className="font-semibold text-navy-900">{r.request_number}</Td>
                        <Td>{SERVICE_LABELS[r.service_type]}</Td>
                        <Td>{formatGallons(r.final_quantity_gal ?? r.quantity_gal)}</Td>
                        <Td>{q ? formatCurrency(Number(q.total)) : '-'}</Td>
                        <Td>{formatDateShort(r.preferred_date)}</Td>
                        <Td><StatusBadge status={r.status} /></Td>
                        <Td className="text-right">
                          <Link href={`/admin/solicitudes/${r.id}`} className="text-sm font-medium text-navy-700 hover:text-navy-500">
                            Ver
                          </Link>
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrapper>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Contacto</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <dl className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-navy-600">
                  <Mail className="h-4 w-4 shrink-0 text-navy-300" aria-hidden />
                  <a href={`mailto:${c.email}`} className="truncate hover:text-navy-700">{c.email}</a>
                </div>
                <div className="flex items-center gap-2 text-navy-600">
                  <Phone className="h-4 w-4 shrink-0 text-navy-300" aria-hidden />
                  {formatPhone(c.phone)}
                </div>
              </dl>
              <WhatsAppButton
                message={`Hola ${c.full_name.split(' ')[0]}, le escribimos de Panama Energy Solutions.`}
                number={c.phone}
                label="WhatsApp"
                size="sm"
                fullWidth
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-navy-300" aria-hidden />
                Direcciones frecuentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(addresses ?? []).length === 0 ? (
                <p className="text-sm text-navy-500">Sin direcciones guardadas.</p>
              ) : (
                <ul className="space-y-3">
                  {((addresses ?? []) as Address[]).map((a) => (
                    <li key={a.id} className="rounded-lg border border-navy-100 p-3.5">
                      <p className="text-sm font-semibold text-navy-900">{a.label}</p>
                      <p className="mt-0.5 text-xs text-navy-500">{FACILITY_LABELS[a.facility_type]}</p>
                      <p className="mt-1.5 text-sm text-navy-600">{a.address_line}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {c.notes_internal && (
            <Card>
              <CardHeader><CardTitle>Notas internas</CardTitle></CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm text-navy-700">{c.notes_internal}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
