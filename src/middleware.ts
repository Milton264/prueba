import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured } from '@/lib/utils';

const CLIENT_PREFIX = '/portal';
const ADMIN_PREFIX = '/admin';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  // Herramientas de soporte fuera de la superficie pública de producción.
  if (pathname === '/diagnostico' && process.env.NODE_ENV === 'production') {
    return new NextResponse(null, { status: 404 });
  }
  if (
    pathname === '/configurar-acceso' &&
    (process.env.ENABLE_SETUP_ROUTE !== 'true' || !process.env.SETUP_SECRET)
  ) {
    return new NextResponse(null, { status: 404 });
  }

  // Sin credenciales de Supabase no hay sesión posible. Se deja pasar la parte
  // pública para poder revisar el diseño, y se bloquean las areas privadas.
  if (!isSupabaseConfigured()) {
    if (pathname.startsWith(CLIENT_PREFIX) || pathname.startsWith(ADMIN_PREFIX)) {
      const url = request.nextUrl.clone();
      url.pathname = '/iniciar-sesion';
      url.searchParams.set('error', 'sin-configurar');
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isProtected = pathname.startsWith(CLIENT_PREFIX) || pathname.startsWith(ADMIN_PREFIX);

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/iniciar-sesion';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', user.id)
      .maybeSingle();

    const role = profile?.role;

    if (profile && profile.is_active === false) {
      const url = request.nextUrl.clone();
      url.pathname = '/iniciar-sesion';
      url.searchParams.set('error', 'cuenta-inactiva');
      return NextResponse.redirect(url);
    }

    // Un cliente no puede entrar al panel administrativo.
    if (pathname.startsWith(ADMIN_PREFIX) && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/portal';
      return NextResponse.redirect(url);
    }

    // Un admin que entra al portal del cliente va a su panel.
    if (pathname.startsWith(CLIENT_PREFIX) && role === 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }

    // Ya autenticado: no mostrar login ni registro.
    if (pathname === '/iniciar-sesion' || pathname === '/registro') {
      const url = request.nextUrl.clone();
      url.pathname = role === 'admin' ? '/admin' : '/portal';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|brand|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
