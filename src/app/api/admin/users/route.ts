import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { requireAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const admin = requireAdminAuth(req, [Role.ADMIN]);
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem gerenciar usuários.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
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
    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json({ error: 'Erro ao listar usuários' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = requireAdminAuth(req, [Role.ADMIN]);
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem cadastrar usuários.' }, { status: 403 });
    }

    const { nome, email, cpf, telefone, senha, role } = await req.json();

    if (!nome || !email || !senha || !role) {
      return NextResponse.json({ error: 'Nome, e-mail, senha e cargo são obrigatórios' }, { status: 400 });
    }

    if (typeof senha !== 'string' || senha.length < 8) {
      return NextResponse.json({ error: 'A senha deve ter no mínimo 8 caracteres.' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return NextResponse.json({ error: 'Este endereço de E-mail já está cadastrado no sistema.' }, { status: 400 });
    }

    if (telefone && String(telefone).trim()) {
      const cleanPhone = String(telefone).trim();
      const existingPhone = await prisma.user.findFirst({ where: { telefone: cleanPhone } });
      if (existingPhone) {
        return NextResponse.json({ error: 'Este número de Telefone já está cadastrado no sistema.' }, { status: 400 });
      }
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const newUser = await prisma.user.create({
      data: {
        nome: String(nome).trim(),
        email: cleanEmail,
        cpf: cpf ? String(cpf).trim() : null,
        telefone: telefone ? String(telefone).trim() : null,
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

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar usuário' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
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
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
        NOT: { id: String(id) },
      },
    });

    if (existingEmail) {
      return NextResponse.json({ error: 'Este endereço de E-mail já pertence a outro usuário.' }, { status: 400 });
    }

    if (telefone && String(telefone).trim()) {
      const cleanPhone = String(telefone).trim();
      const existingPhone = await prisma.user.findFirst({
        where: {
          telefone: cleanPhone,
          NOT: { id: String(id) },
        },
      });

      if (existingPhone) {
        return NextResponse.json({ error: 'Este número de Telefone já pertence a outro usuário.' }, { status: 400 });
      }
    }

    const dataToUpdate: any = {
      nome: String(nome).trim(),
      email: cleanEmail,
      cpf: cpf ? String(cpf).trim() : null,
      telefone: telefone ? String(telefone).trim() : null,
      role: role as Role,
    };

    if (novaSenha && novaSenha.trim().length >= 8) {
      dataToUpdate.senha_hash = await bcrypt.hash(novaSenha.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
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

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ error: 'Erro ao atualizar dados do usuário' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = requireAdminAuth(req, [Role.ADMIN]);
    if (!admin) {
      return NextResponse.json({ error: 'Apenas administradores podem excluir usuários.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    if (id === admin.userId) {
      return NextResponse.json({ error: 'Você não pode excluir a sua própria conta ativa.' }, { status: 400 });
    }

    // Exclusão segura mantendo a integridade dos pedidos (user_id -> NULL em Orders)
    await prisma.user.delete({ where: { id: String(id) } });

    return NextResponse.json({ success: true, message: 'Usuário/Cliente excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 });
  }
}
