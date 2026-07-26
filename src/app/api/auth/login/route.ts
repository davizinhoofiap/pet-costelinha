import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { getClientIp } from '@/lib/rate-limit';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { checkRateLimit } from '@/lib/upstash-ratelimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // 1. Rate Limiting Distribuído via Upstash Redis (5 tentativas / 60s por IP)
    const rateCheck = await checkRateLimit(`login:${ip}`, 5, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Muitas tentativas de login. Por favor, aguarde 1 minuto antes de tentar novamente.' },
        { status: 429 }
      );
    }

    const { email, password, turnstileToken } = await req.json();

    // 2. Validação Anti-Bot do Cloudflare Turnstile (se fornecido)
    if (turnstileToken) {
      const turnstileCheck = await verifyTurnstileToken(turnstileToken, ip);
      if (!turnstileCheck.success) {
        return NextResponse.json(
          { error: turnstileCheck.message || 'Validação Anti-Bot do Turnstile falhou.' },
          { status: 400 }
        );
      }
    }

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.senha_hash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const token = signToken({
      userId: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cpf: user.cpf,
        role: user.role,
      },
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
