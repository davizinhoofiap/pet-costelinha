import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { requireAdminAuth } from '@/lib/auth';
import { userCreateSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  try {
    const admin = requireAdminAuth(req, [Role.ADMIN]);
    if (!admin) {
      logger.warn('Tentativa de acesso negado ao listar usuários no Admin', { requestId });
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem gerenciar usuários.' }, { status: 403 });
    }

    const users = await logger.measureTime('Admin.listUsers', async () => {
      return prisma.user.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          cpf: true,
          telefone: true,
          role: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
      });
    }, { requestId });

    return NextResponse.json(users, { headers: { 'X-Request-ID': requestId } });
  } catch (error: any) {
    logger.error('Erro ao listar usuários no Admin', { requestId, error: error.message });
    return NextResponse.json({ error: 'Erro interno ao listar usuários' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  try {
    const admin = requireAdminAuth(req, [Role.ADMIN]);
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem cadastrar usuários.' }, { status: 403 });
    }

    const body = await req.json();

    const parseResult = userCreateSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || 'Dados inválidos fornecidos.';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { nome, email, cpf, telefone, senha, role } = parseResult.data;

    const existingEmailUser = await prisma.user.findUnique({ where: { email } });
    const existingPhoneUser = telefone ? await prisma.user.findFirst({ where: { telefone } }) : null;

    if (existingEmailUser && existingPhoneUser) {
      return NextResponse.json(
        { error: 'Este E-mail e este número de Telefone já estão cadastrados no sistema.' },
        { status: 400 }
      );
    }
    if (existingEmailUser) {
      return NextResponse.json(
        { error: 'Este E-mail já está cadastrado no sistema.' },
        { status: 400 }
      );
    }
    if (existingPhoneUser) {
      return NextResponse.json(
        { error: 'Este número de Telefone já está cadastrado no sistema.' },
        { status: 400 }
      );
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const newUser = await logger.measureTime('Admin.createUser', async () => {
      return prisma.user.create({
        data: {
          nome: nome.trim(),
          email,
          cpf: cpf || null,
          telefone: telefone || null,
          senha_hash,
          role: role as Role,
        },
        select: {
          id: true,
          nome: true,
          email: true,
          cpf: true,
          telefone: true,
          role: true,
          created_at: true,
        },
      });
    }, { requestId, userRole: role });

    logger.info('Novo usuário cadastrado via Admin', { requestId, createdUserId: newUser.id });
    return NextResponse.json(newUser, { status: 201, headers: { 'X-Request-ID': requestId } });
  } catch (error: any) {
    logger.error('Erro ao cadastrar usuário via Admin', { requestId, error: error.message });
    return NextResponse.json({ error: 'Erro ao cadastrar usuário' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  try {
    const admin = requireAdminAuth(req, [Role.ADMIN]);
    if (!admin) {
      return NextResponse.json({ error: 'Apenas administradores podem editar contas de usuários.' }, { status: 403 });
    }

    const { id, nome, email, cpf, telefone, role, novaSenha } = await req.json();

    if (!id || !nome || !email || !role) {
      return NextResponse.json({ error: 'ID, Nome, E-mail e Cargo são obrigatórios' }, { status: 400 });
    }

    if (novaSenha && (typeof novaSenha !== 'string' || novaSenha.trim().length < 8)) {
      return NextResponse.json({ error: 'A nova senha deve possuir no mínimo 8 caracteres.' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPhone = telefone && String(telefone).trim() ? String(telefone).replace(/\D/g, '') : null;

    const existingEmailUser = await prisma.user.findFirst({
      where: { email: cleanEmail, NOT: { id: String(id) } },
    });
    const existingPhoneUser = cleanPhone
      ? await prisma.user.findFirst({ where: { telefone: cleanPhone, NOT: { id: String(id) } } })
      : null;

    if (existingEmailUser && existingPhoneUser) {
      return NextResponse.json(
        { error: 'Este E-mail e este número de Telefone já pertencem a outra conta no sistema.' },
        { status: 400 }
      );
    }
    if (existingEmailUser) {
      return NextResponse.json(
        { error: 'Este E-mail já está cadastrado em outra conta no sistema.' },
        { status: 400 }
      );
    }
    if (existingPhoneUser) {
      return NextResponse.json(
        { error: 'Este número de Telefone já está cadastrado em outra conta no sistema.' },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {
      nome: String(nome).trim(),
      email: cleanEmail,
      cpf: cpf ? String(cpf).replace(/\D/g, '') : null,
      telefone: cleanPhone,
      role: role as Role,
    };

    if (novaSenha && novaSenha.trim().length >= 8) {
      dataToUpdate.senha_hash = await bcrypt.hash(novaSenha.trim(), 10);
    }

    const updatedUser = await logger.measureTime('Admin.updateUser', async () => {
      return prisma.user.update({
        where: { id: String(id) },
        data: dataToUpdate,
        select: {
          id: true,
          nome: true,
          email: true,
          cpf: true,
          telefone: true,
          role: true,
          created_at: true,
        },
      });
    }, { requestId, targetUserId: id });

    return NextResponse.json(updatedUser, { headers: { 'X-Request-ID': requestId } });
  } catch (error: any) {
    logger.error('Erro ao atualizar usuário no Admin', { requestId, error: error.message });
    return NextResponse.json({ error: 'Erro ao atualizar dados do usuário' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  try {
    const admin = requireAdminAuth(req, [Role.ADMIN]);
    if (!admin) {
      return NextResponse.json({ error: 'Apenas administradores podem excluir usuários.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userIdsParam = searchParams.get('userIds');

    let idsToDelete: string[] = [];

    if (id) {
      idsToDelete.push(id);
    } else if (userIdsParam) {
      idsToDelete = userIdsParam.split(',').filter(Boolean);
    } else {
      const body = await req.json().catch(() => ({}));
      if (Array.isArray(body.userIds) && body.userIds.length > 0) {
        idsToDelete = body.userIds;
      }
    }

    // Não permite excluir a própria conta ativa do admin logado
    idsToDelete = idsToDelete.filter((targetId) => targetId !== admin.userId);

    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: 'Selecione pelo menos um usuário válido para exclusão.' }, { status: 400 });
    }

    // Anonimização LGPD nos pedidos passados dos usuários
    await prisma.order.updateMany({
      where: { user_id: { in: idsToDelete } },
      data: {
        user_id: null,
        cliente_nome: 'CLIENTE_ANONIMIZADO_LGPD',
        cliente_email: 'anonimizado@lgpd.local',
        cliente_cpf: '000.000.000-00',
        cliente_telefone: '(00) 00000-0000',
        endereco_entrega: 'ENDEREÇO_ANONIMIZADO_LGPD',
      },
    });

    const result = await prisma.user.deleteMany({
      where: { id: { in: idsToDelete } },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} usuário(s) excluído(s) permanentemente.`,
    });
  } catch (error: any) {
    logger.error('Erro na exclusão segura de usuários', { requestId, error: error.message });
    return NextResponse.json({ error: 'Erro ao executar exclusão segura.' }, { status: 500 });
  }
}
