import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
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
    const { nome, email, cpf, senha, role } = await req.json();

    if (!nome || !email || !senha || !role) {
      return NextResponse.json({ error: 'Nome, e-mail, senha e cargo são obrigatórios' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado' }, { status: 400 });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const newUser = await prisma.user.create({
      data: {
        nome,
        email,
        cpf: cpf || null,
        senha_hash,
        role: role as Role,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
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
    const tokenCookie = cookies().get('token')?.value;
    const user = tokenCookie ? verifyToken(tokenCookie) : null;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem editar contas de usuários.' }, { status: 403 });
    }

    const { id, nome, email, cpf, role, novaSenha } = await req.json();

    if (!id || !nome || !email || !role) {
      return NextResponse.json({ error: 'ID, Nome, E-mail e Cargo são obrigatórios' }, { status: 400 });
    }

    const dataToUpdate: any = {
      nome,
      email,
      cpf: cpf || null,
      role: role as Role,
    };

    if (novaSenha && novaSenha.trim().length > 0) {
      dataToUpdate.senha_hash = await bcrypt.hash(novaSenha, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
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
    const tokenCookie = cookies().get('token')?.value;
    const user = tokenCookie ? verifyToken(tokenCookie) : null;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem excluir usuários.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Não permitir excluir a própria conta
    if (id === user.userId) {
      return NextResponse.json({ error: 'Você não pode excluir a sua própria conta ativa.' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 });
  }
}
