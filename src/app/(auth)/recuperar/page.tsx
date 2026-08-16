import type { Metadata } from 'next';
import Link from 'next/link';
import { RecoverForm } from './recover-form';

export const metadata: Metadata = { title: 'Recuperar contraseña' };

export default function RecoverPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Recuperar contraseña</h1>
      <p className="mt-2 text-sm text-navy-500">
        Ingresa tu correo y te enviaremos un enlace para restablecerla.
      </p>

      <RecoverForm />

      <p className="mt-8 text-center text-sm text-navy-500">
        <Link href="/iniciar-sesion" className="font-semibold text-navy-800 hover:text-navy-600">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
