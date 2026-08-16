import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from './register-form';

export const metadata: Metadata = { title: 'Crear cuenta' };

export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>
      <p className="mt-2 text-sm text-navy-500">
        Regístrate para enviar solicitudes y llevar el historial de tus servicios.
      </p>

      <RegisterForm />

      <p className="mt-8 text-center text-sm text-navy-500">
        Ya tienes cuenta?{' '}
        <Link href="/iniciar-sesion" className="font-semibold text-navy-800 hover:text-navy-600">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
