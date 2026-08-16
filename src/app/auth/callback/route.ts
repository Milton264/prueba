import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/**
 * Callback de confirmación de correo y recuperación de contraseña.
 *
 * Los enlaces que envía Supabase pueden llegar en dos formatos según la versión
 * y la configuración del proyecto:
 *   1. PKCE     ->  ?code=xxxx
 *   2. OTP/hash ->  ?token_hash=xxxx&type=signup|recovery|magiclink|email
 *
 * Se manejan ambos para que la confirmación no falle. Antes solo se atendía el
 * caso PKCE, por lo que los enlaces con token_hash caían en "enlace-invalido"
 * y el usuario nunca obtenía sesión aunque hiciera clic en el correo.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next');
  const errorCode = searchParams.get('error_code') || searchParams.get('error');

  // Si Supabase ya devolvió un error en la propia URL (p. ej. otp_expired:
  // el enlace del correo expiró o ya se usó), no hay nada que canjear. Se
  // redirige de inmediato al login, sin intentar llamadas que se cuelguen.
  if (errorCode) {
    return NextResponse.redirect(`${origin}/iniciar-sesion?error=enlace-invalido`);
  }

  const supabase = await createClient();
  let authedUserId: string | null = null;

  if (code) {
    // Flujo PKCE
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) authedUserId = data.user.id;
  } else if (tokenHash && type) {
    // Flujo OTP / token_hash
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error && data.user) authedUserId = data.user.id;
  }

  if (authedUserId) {
    // Recuperación de contraseña: llevar a la pantalla para definir nueva clave.
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/recuperar?paso=nueva`);
    }

    const { data } = await supabase.from('users').select('role').eq('id', authedUserId).single();
    const destino = next || (data?.role === 'admin' ? '/admin' : '/portal');
    return NextResponse.redirect(`${origin}${destino}`);
  }

  return NextResponse.redirect(`${origin}/iniciar-sesion?error=enlace-invalido`);
}
