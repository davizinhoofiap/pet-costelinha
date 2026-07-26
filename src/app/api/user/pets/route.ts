import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { nome, especie, raca, porte, idade, observacao } = await req.json();

    if (!nome || !especie) {
      return NextResponse.json({ error: 'Nome e espécie do pet são obrigatórios.' }, { status: 400 });
    }

    const pet = await prisma.pet.create({
      data: {
        user_id: authUser.userId,
        nome,
        especie,
        raca: raca || null,
        porte: porte || 'Médio',
        idade: idade || null,
        observacao: observacao || null,
      },
    });

    return NextResponse.json({ success: true, pet, message: 'Pet cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar pet:', error);
    return NextResponse.json({ error: 'Erro interno ao cadastrar pet.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const petId = searchParams.get('id');

    if (!petId) {
      return NextResponse.json({ error: 'ID do pet é obrigatório.' }, { status: 400 });
    }

    // Verificar se o pet pertence ao usuário logado
    const pet = await prisma.pet.findFirst({
      where: { id: petId, user_id: authUser.userId },
    });

    if (!pet) {
      return NextResponse.json({ error: 'Pet não encontrado ou sem permissão.' }, { status: 404 });
    }

    await prisma.pet.delete({
      where: { id: petId },
    });

    return NextResponse.json({ success: true, message: 'Pet removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover pet:', error);
    return NextResponse.json({ error: 'Erro ao remover pet.' }, { status: 500 });
  }
}
