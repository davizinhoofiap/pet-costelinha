import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Sessão encerrada e cookies removidos com sucesso.',
  });

  // Apaga o cookie HTTP-Only 'token' definindo maxAge = 0 e expiração no passado
  response.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
