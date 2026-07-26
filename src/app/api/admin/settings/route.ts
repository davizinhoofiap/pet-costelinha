import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { requireAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const admin = requireAdminAuth(req, [Role.ADMIN, Role.GERENTE]);
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

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
    const admin = requireAdminAuth(req, [Role.ADMIN]);
    if (!admin) {
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
        nome_loja: nome_loja ? String(nome_loja).trim() : 'Pet Costelinha',
        slogan: slogan ? String(slogan).trim() : '',
        telefone: telefone ? String(telefone).trim() : '',
        whatsapp: whatsapp ? String(whatsapp).trim() : '',
        email_suporte: email_suporte ? String(email_suporte).trim() : '',
        endereco: endereco ? String(endereco).trim() : '',
        cnpj: cnpj ? String(cnpj).trim() : '',
        chave_pix: chave_pix ? String(chave_pix).trim() : '',
      },
      create: {
        id: 'default',
        nome_loja: nome_loja ? String(nome_loja).trim() : 'Pet Costelinha',
        slogan: slogan ? String(slogan).trim() : '',
        telefone: telefone ? String(telefone).trim() : '',
        whatsapp: whatsapp ? String(whatsapp).trim() : '',
        email_suporte: email_suporte ? String(email_suporte).trim() : '',
        endereco: endereco ? String(endereco).trim() : '',
        cnpj: cnpj ? String(cnpj).trim() : '',
        chave_pix: chave_pix ? String(chave_pix).trim() : '',
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar configurações' }, { status: 500 });
  }
}
