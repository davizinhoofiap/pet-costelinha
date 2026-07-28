import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // aqui a gente cria um ID único pra cada requisição pra conseguir rastrear tudo nos logs
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();

  // repassa esse ID único nos cabeçalhos pra que as rotas de API consigam usar também
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // devolve o ID único na resposta pro navegador ou pro cliente ver
  response.headers.set('X-Request-ID', requestId);

  // adiciona os cabeçalhos de segurança pra proteger o site contra ataques e iframe não autorizado
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://accounts.google.com https://apis.google.com; frame-src 'self' https://challenges.cloudflare.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://api.mercadopago.com https://viacep.com.br https://challenges.cloudflare.com https://accounts.google.com;"
  );
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
