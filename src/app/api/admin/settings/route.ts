import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let settings = await prisma.storeSetting.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.storeSetting.create({
        data: { id: 'default' },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json({ error: 'Erro ao buscar configurações da loja' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const tokenCookie = cookies().get('token')?.value;
    const user = tokenCookie ? verifyToken(tokenCookie) : null;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso restrito a administradores.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { nome_loja, slogan, telefone, whatsapp, email_suporte, endereco, cnpj, chave_pix } = body;

    const updatedSettings = await prisma.storeSetting.upsert({
      where: { id: 'default' },
      update: {
        nome_loja: nome_loja || 'Pet Costelinha',
        slogan: slogan || '',
        telefone: telefone || '',
        whatsapp: whatsapp || '',
        email_suporte: email_suporte || '',
        endereco: endereco || '',
        cnpj: cnpj || '',
        chave_pix: chave_pix || '',
      },
      create: {
        id: 'default',
        nome_loja: nome_loja || 'Pet Costelinha',
        slogan: slogan || '',
        telefone: telefone || '',
        whatsapp: whatsapp || '',
        email_suporte: email_suporte || '',
        endereco: endereco || '',
        cnpj: cnpj || '',
        chave_pix: chave_pix || '',
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar configurações' }, { status: 500 });
  }
}
