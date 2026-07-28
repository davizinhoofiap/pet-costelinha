import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { profileUpdateSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Sessão expirada ou não autenticado.' }, { status: 401, headers: { 'X-Request-ID': requestId } });
    }

    const user = await logger.measureTime('Profile.getUser', async () => {
      return prisma.user.findUnique({
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
    }, { requestId, userId: authUser.userId });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404, headers: { 'X-Request-ID': requestId } });
    }

    return NextResponse.json(user, { headers: { 'X-Request-ID': requestId } });
  } catch (error: any) {
    logger.error('Erro ao buscar perfil do usuário', { requestId, error: error.message });
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500, headers: { 'X-Request-ID': requestId } });
  }
}

export async function PUT(req: Request) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401, headers: { 'X-Request-ID': requestId } });
    }

    const body = await req.json();

    // Validação Zod & Sanitização de Entradas
    const parseResult = profileUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || 'Dados inválidos fornecidos.';
      return NextResponse.json({ error: errorMsg }, { status: 400, headers: { 'X-Request-ID': requestId } });
    }

    const { nome, email, telefone, cpf, endereco } = parseResult.data;

    // Trava de unicidade para E-mail e Telefone no perfil
    const cleanEmail = email ? String(email).toLowerCase().trim() : null;
    const cleanPhone = telefone ? String(telefone).trim() : null;

    const existingEmailUser = cleanEmail
      ? await prisma.user.findFirst({ where: { email: cleanEmail, NOT: { id: authUser.userId } } })
      : null;
    const existingPhoneUser = cleanPhone
      ? await prisma.user.findFirst({ where: { telefone: cleanPhone, NOT: { id: authUser.userId } } })
      : null;

    if (existingEmailUser && existingPhoneUser) {
      return NextResponse.json(
        { error: 'Este E-mail e este número de Telefone já estão cadastrados em outra conta no sistema.' },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    if (existingEmailUser) {
      return NextResponse.json(
        { error: 'Este endereço de E-mail já está cadastrado em outra conta no sistema.' },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    if (existingPhoneUser) {
      return NextResponse.json(
        { error: 'Este número de Telefone já está cadastrado em outra conta no sistema.' },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }

    // 1. Atualizar dados básicos do tutor
    const updatedUser = await logger.measureTime('Profile.updateUserDB', async () => {
      return prisma.user.update({
        where: { id: authUser.userId },
        data: {
          nome: nome || undefined,
          email: cleanEmail || undefined,
          telefone: cleanPhone || undefined,
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
    }, { requestId, userId: authUser.userId });

    // 2. Se forneceu dados de endereço, upsert o endereço principal
    if (endereco && endereco.cep) {
      await logger.measureTime('Profile.upsertAddressDB', async () => {
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
      }, { requestId, userId: authUser.userId });
    }

    logger.info('Perfil de usuário atualizado com sucesso', { requestId, userId: authUser.userId });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Perfil e endereço atualizados com sucesso!',
    }, {
      headers: { 'X-Request-ID': requestId },
    });
  } catch (error: any) {
    logger.error('Erro ao atualizar perfil', { requestId, error: error.message });
    return NextResponse.json(
      { error: error.message || 'Erro ao salvar alterações no perfil.' },
      { status: 500, headers: { 'X-Request-ID': requestId } }
    );
  }
}
