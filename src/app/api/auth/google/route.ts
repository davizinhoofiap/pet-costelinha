import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { Role } from '@prisma/client';
import { checkRateLimit } from '@/lib/upstash-ratelimit';
import { getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // 1. Rate Limiting via Upstash Redis (Máx 10 tentativas a cada 60s por IP)
    const rateCheck = await checkRateLimit(`google_auth:${ip}`, 10, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Muitas tentativas de autenticação. Por favor, aguarde 1 minuto.' },
        { status: 429 }
      );
    }

    const { credential, idToken } = await req.json();
    const tokenToValidate = credential || idToken;

    if (!tokenToValidate) {
      return NextResponse.json({ error: 'Token do Google OAuth não foi fornecido.' }, { status: 400 });
    }

    // 2. Validação Direta do Token Oficial no Servidor do Google OAuth (Sem exigência de Turnstile para Social Login)
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenToValidate}`);

    if (!googleRes.ok) {
      console.error(`❌ Tokeninfo Google falhou com status ${googleRes.status}`);
      return NextResponse.json({ error: 'Token do Google inválido ou expirado.' }, { status: 401 });
    }

    const googleUser = await googleRes.json();
    const { email, name, sub, picture } = googleUser;

    if (!email) {
      return NextResponse.json({ error: 'Não foi possível obter o e-mail do perfil do Google.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 3. Buscar ou Criar Usuário no Banco de Dados
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Criar nova conta vinculada ao Google
      user = await prisma.user.create({
        data: {
          nome: name || 'Usuário Google',
          email: cleanEmail,
          senha_hash: `google_oauth_${sub}`,
          role: Role.CLIENTE,
        },
      });
      console.log(`✅ Nova conta cadastrada via Google OAuth: ${cleanEmail}`);
    }

    // 4. Emitir JWT da Aplicação
    const appToken = signToken({
      userId: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cpf: user.cpf,
        role: user.role,
        picture: picture || null,
      },
      token: appToken,
    });

    response.cookies.set('token', appToken, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;
  } catch (error) {
    console.error('❌ Erro no processamento do Google OAuth:', error);
    return NextResponse.json({ error: 'Erro interno ao autenticar com o Google.' }, { status: 500 });
  }
}
