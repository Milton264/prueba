import type { Metadata } from 'next';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/misc';
import { Badge } from '@/components/ui/badge';
import { Table, TableWrapper, Td, Th, Thead, Tr } from '@/components/ui/table';
import { formatDateShort, formatPhone } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Clientes' };

export default async function AdminClientesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('client_profiles')
    .select('*, service_requests(id)')
    .order('created_at', { ascending: false })
    .limit(200);

  const list = (data ?? []) as {
    id: string;
    user_id: string | null;
    full_name: string;
    company_name: string | null;
    email: string;
    phone: string | null;
    created_at: string;
    service_requests: { id: string }[];
  }[];

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Directorio de clientes registrados y de quienes han solicitado como invitados."
      />

      <Card>
        {list.length === 0 ? (
          <EmptyState icon={Users} title="Sin clientes registrados" description="Los clientes aparecerán al recibir la primera solicitud." />
        ) : (
          <TableWrapper>
            <Table className="min-w-[800px]">
              <Thead>
                <tr>
                  <Th>Cliente</Th>
                  <Th>Empresa</Th>
                  <Th>Correo</Th>
                  <Th>Teléfono</Th>
                  <Th>Solicitudes</Th>
                  <Th>Registro</Th>
                  <Th className="text-right">Acción</Th>
                </tr>
              </Thead>
              <tbody>
                {list.map((c) => (
                  <Tr key={c.id}>
                    <Td className="font-medium text-navy-900">
                      {c.full_name}
                      {!c.user_id && <span className="ml-2"><Badge tone="neutral">Invitado</Badge></span>}
                    </Td>
                    <Td className="text-navy-600">{c.company_name ?? '-'}</Td>
                    <Td className="text-navy-600">{c.email}</Td>
                    <Td className="text-navy-600">{formatPhone(c.phone)}</Td>
                    <Td>{c.service_requests?.length ?? 0}</Td>
                    <Td className="text-navy-500">{formatDateShort(c.created_at)}</Td>
                    <Td className="text-right">
                      <Link href={`/admin/clientes/${c.id}`} className="text-sm font-medium text-navy-700 hover:text-navy-500">
                        Ver ficha
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </Card>
    </div>
  );
}
