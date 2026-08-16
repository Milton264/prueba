import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader, Notice } from '@/components/ui/misc';
import { Table, TableWrapper, Td, Th, Thead, Tr } from '@/components/ui/table';
import { SettingsForm } from './settings-form';
import { UserRoleForm } from './user-role-form';
import { siteConfig } from '@/config/site';
import { formatDateShort } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/supabase/queries';
import type { AppUser, SystemSettings } from '@/types';

export const metadata: Metadata = { title: 'Configuración' };

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const [{ data: settings }, { data: users }, me] = await Promise.all([
    supabase.from('system_settings').select('*').limit(1).maybeSingle(),
    supabase.from('users').select('*').order('created_at', { ascending: false }).limit(100),
    getSessionUser(),
  ]);

  const s = settings as SystemSettings | null;
  const list = (users ?? []) as AppUser[];

  return (
    <div>
      <PageHeader title="Configuración" description="Datos de la empresa, impuestos, numeracion y usuarios." />

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Datos de la empresa</CardTitle></CardHeader>
          <CardContent>
            <SettingsForm
              defaults={{
                company_name: s?.company_name ?? siteConfig.name,
                tagline: s?.tagline ?? siteConfig.tagline,
                logo_path: s?.logo_path ?? siteConfig.logo.primary,
                contact_email: s?.contact_email ?? siteConfig.email,
                whatsapp_number: s?.whatsapp_number ?? siteConfig.whatsapp,
                website_url: s?.website_url ?? '',
                address: s?.address ?? siteConfig.address,
                tax_rate: Number(s?.tax_rate ?? 0),
                request_prefix: s?.request_prefix ?? 'PES',
                quotation_prefix: s?.quotation_prefix ?? 'COT',
                quotation_terms: s?.quotation_terms ?? '',
                privacy_policy: s?.privacy_policy ?? '',
                terms_conditions: s?.terms_conditions ?? '',
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Logo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Notice tone="info">
              Para usar el archivo oficial de PES, reemplaza los archivos en{' '}
              <code className="rounded bg-navy-100 px-1.5 py-0.5 text-xs">public/brand/</code>{' '}
              conservando los nombres <code className="rounded bg-navy-100 px-1.5 py-0.5 text-xs">pes-logo.svg</code>,{' '}
              <code className="rounded bg-navy-100 px-1.5 py-0.5 text-xs">pes-logo-white.svg</code> y{' '}
              <code className="rounded bg-navy-100 px-1.5 py-0.5 text-xs">pes-isotipo.svg</code>. El
              componente <code className="rounded bg-navy-100 px-1.5 py-0.5 text-xs">&lt;Logo /&gt;</code> lo
              tomara automáticamente en toda la plataforma, sin alterar el diseño ni las proporciones.
            </Notice>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Usuarios administradores</CardTitle></CardHeader>
          <TableWrapper>
            <Table className="min-w-[680px]">
              <Thead>
                <tr>
                  <Th>Nombre</Th>
                  <Th>Correo</Th>
                  <Th>Rol</Th>
                  <Th>Estado</Th>
                  <Th>Registro</Th>
                  <Th className="text-right">Acción</Th>
                </tr>
              </Thead>
              <tbody>
                {list.map((u) => (
                  <Tr key={u.id}>
                    <Td className="font-medium text-navy-900">
                      {u.full_name || '-'}
                      {u.id === me?.id && <span className="ml-2 text-xs font-normal text-navy-300">(tu)</span>}
                    </Td>
                    <Td className="text-navy-600">{u.email}</Td>
                    <Td>
                      <Badge tone={u.role === 'admin' ? 'gold' : 'neutral'}>
                        {u.role === 'admin' ? 'Administrador' : 'Cliente'}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge tone={u.is_active ? 'success' : 'danger'}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </Td>
                    <Td className="text-navy-500">{formatDateShort(u.created_at)}</Td>
                    <Td className="text-right">
                      <UserRoleForm user={u} isSelf={u.id === me?.id} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
          <CardContent>
            <Notice tone="info">
              Los usuarios se crean al registrarse en la plataforma. Desde aquí puedes elevarlos a
              administrador o desactivarlos.
            </Notice>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
