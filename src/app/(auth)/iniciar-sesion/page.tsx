import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Iniciar sesión' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-navy-500">
        Accede a tu portal para consultar solicitudes y cotizaciones.
      </p>

      {params.error === 'sin-configurar' && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Supabase aún no está configurado. Completa <code className="font-sans">.env.local</code> y
          ejecuta los scripts SQL para habilitar el portal y el panel administrativo. Mientras tanto
          puedes recorrer la parte pública del sitio.
        </div>
      )}

      {params.error === 'cuenta-inactiva' && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Tu cuenta está inactiva. Comunícate con el equipo de PES.
        </div>
      )}

      {params.error === 'enlace-invalido' && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          El enlace de confirmación no es válido o ya expiró. No te preocupes: ya no hace falta
          confirmar por correo. Inicia sesión abajo con tu correo y contraseña, o usa{' '}
          <Link href="/configurar-acceso" className="font-semibold underline">
            Configurar acceso
          </Link>{' '}
          para crear tu cuenta y entrar al instante.
        </div>
      )}

      <LoginForm next={params.next} />

      <p className="mt-8 text-center text-sm text-navy-500">
        Nuevo cliente?{' '}
        <Link href="/registro" className="font-semibold text-navy-800 hover:text-navy-600">
          Crear cuenta
        </Link>{' '}
        o{' '}
        <Link href="/solicitar" className="font-semibold text-gold-700 hover:text-gold-700">
          solicitar servicio
        </Link>
      </p>

      <div className="mt-6 border-t border-navy-100 pt-5 text-center">
        <p className="font-sans text-[10px] uppercase tracking-eyebrow text-navy-400">
          Equipo PES
        </p>
        <Link
          href="/configurar-acceso"
          className="mt-1.5 inline-block text-sm font-medium text-navy-600 hover:text-navy-900"
        >
          Configurar o acceder como administrador
        </Link>
      </div>
    </div>
  );
}
