import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Sessão expirada ou não autenticado.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        foto_url: true,
        role: true,
        created_at: true,
        addresses: {
          orderBy: { created_at: 'desc' },
        },
        pets: {
          orderBy: { created_at: 'desc' },
        },
        orders: {
          take: 5,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            total_valor: true,
            status: true,
            created_at: true,
            metodo_pagamento: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { nome, telefone, cpf, endereco } = body;

    // Trava de unicidade de Telefone no perfil
    if (telefone && String(telefone).trim()) {
      const cleanPhone = String(telefone).trim();
      const existingPhoneUser = await prisma.user.findFirst({
        where: {
          telefone: cleanPhone,
          NOT: { id: authUser.userId },
        },
      });

      if (existingPhoneUser) {
        return NextResponse.json(
          { error: 'Este número de Telefone já está cadastrado em outra conta no sistema.' },
          { status: 400 }
        );
      }
    }

    // 1. Atualizar dados básicos do tutor
    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        nome: nome || undefined,
        telefone: telefone || undefined,
        cpf: cpf || undefined,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        role: true,
      },
    });

    // 2. Se forneceu dados de endereço, upsert o endereço principal
    if (endereco && endereco.cep) {
      const existingAddress = await prisma.address.findFirst({
        where: { user_id: authUser.userId, principal: true },
      });

      if (existingAddress) {
        await prisma.address.update({
          where: { id: existingAddress.id },
          data: {
            cep: endereco.cep,
            logradouro: endereco.logradouro,
            numero: endereco.numero,
            complemento: endereco.complemento || null,
            bairro: endereco.bairro,
            cidade: endereco.cidade,
            estado: endereco.estado,
          },
        });
      } else {
        await prisma.address.create({
          data: {
            user_id: authUser.userId,
            cep: endereco.cep,
            logradouro: endereco.logradouro,
            numero: endereco.numero,
            complemento: endereco.complemento || null,
            bairro: endereco.bairro,
            cidade: endereco.cidade,
            estado: endereco.estado,
            principal: true,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Perfil e endereço atualizados com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao salvar alterações no perfil.' },
      { status: 500 }
    );
  }
}
