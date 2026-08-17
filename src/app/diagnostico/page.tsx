import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

/**
 * Página de diagnóstico para depurar el acceso en local. Muestra si las
 * variables de entorno están presentes y si la conexión a Supabase responde.
 * Abrir en el navegador: /diagnostico
 *
 * No expone secretos: solo indica presencia/ausencia y prefijos.
 */
export const dynamic = 'force-dynamic';

async function checks() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const resend = process.env.RESEND_API_KEY;
  const rfqFrom = process.env.RFQ_FROM_EMAIL;
  const rfqTo = process.env.RFQ_NOTIFICATION_TO || process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  const result: { label: string; ok: boolean; detail: string }[] = [];

  result.push({
    label: 'NEXT_PUBLIC_SUPABASE_URL',
    ok: !!url,
    detail: url ? url : 'FALTA',
  });
  result.push({
    label: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ok: !!anon,
    detail: anon ? `presente (${anon.slice(0, 8)}…)` : 'FALTA',
  });
  result.push({
    label: 'SUPABASE_SERVICE_ROLE_KEY',
    ok: !!service,
    detail: service ? `presente (${service.slice(0, 8)}…)` : 'FALTA — el registro auto-confirmado no funcionará',
  });
  result.push({
    label: 'NEXT_PUBLIC_SITE_URL',
    ok: !!site,
    detail: site || 'FALTA (se usará el valor por defecto)',
  });
  result.push({
    label: 'Notificación de nuevas RFQ',
    ok: !!resend && !!rfqFrom && !!rfqTo,
    detail: resend && rfqFrom && rfqTo
      ? `Activa — destino: ${rfqTo}`
      : 'FALTA RESEND_API_KEY, RFQ_FROM_EMAIL o RFQ_NOTIFICATION_TO',
  });

  // Prueba de conexión: contar filas de una tabla pública.
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('catalog_services').select('service_type').limit(1);
    result.push({
      label: 'Conexión a la base de datos',
      ok: !error,
      detail: error ? `Error: ${error.message}` : 'OK — la base responde',
    });
  } catch (e) {
    result.push({
      label: 'Conexión a la base de datos',
      ok: false,
      detail: `No se pudo conectar: ${(e as Error).message}`,
    });
  }

  // Sesión actual
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    result.push({
      label: 'Sesión actual',
      ok: true,
      detail: user ? `Autenticado como ${user.email}` : 'Sin sesión (normal si no has iniciado sesión)',
    });
  } catch (e) {
    result.push({ label: 'Sesión actual', ok: false, detail: (e as Error).message });
  }

  return result;
}

export default async function DiagnosticoPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  const result = await checks();
  const allOk = result.every((r) => r.ok);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-sans text-2xl font-semibold text-navy-900">Diagnóstico de acceso</h1>
      <p className="mt-2 text-sm text-navy-500">
        Esta página verifica la conexión con Supabase. En producción permanece cerrada y responde 404.
      </p>

      <div className={`mt-6 rounded-lg border px-4 py-3 text-sm ${allOk ? 'border-green-300 bg-green-50 text-green-800' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>
        {allOk ? 'Todo parece correcto. Si aún no puedes entrar, revisa el detalle de abajo.' : 'Hay algo que revisar. Mira los puntos marcados abajo.'}
      </div>

      <ul className="mt-6 divide-y divide-navy-100 border-t-2 border-navy-900">
        {result.map((r) => (
          <li key={r.label} className="flex items-start gap-3 py-4">
            <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ${r.ok ? 'bg-green-600' : 'bg-amber-600'}`}>
              {r.ok ? '✓' : '!'}
            </span>
            <div>
              <p className="font-sans text-[12px] font-semibold uppercase tracking-wide2 text-navy-800">{r.label}</p>
              <p className="mt-1 break-all text-[13px] text-navy-600">{r.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-lg border border-navy-100 bg-mist px-5 py-4 text-[13px] leading-relaxed text-navy-600">
        <p className="font-semibold text-navy-800">Cómo entrar de forma garantizada:</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Crea una cuenta desde <code className="font-sans">/registro</code> — ahora queda confirmada al instante y entra sola al portal.</li>
          <li>O crea un administrador con el script: <code className="font-sans">node scripts/crear-usuario.mjs correo@pes.com "Clave#9" --admin</code></li>
          <li>Luego inicia sesión en <code className="font-sans">/iniciar-sesion</code>.</li>
        </ol>
      </div>
    </div>
  );
}
