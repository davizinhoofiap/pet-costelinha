import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { requireAdminAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const admin = requireAdminAuth(req);
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado. Autenticação administrativa necessária.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('busca');
    const status = searchParams.get('status');

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status as OrderStatus;
    }

    if (search) {
      where.OR = [
        { cliente_nome: { contains: search } },
        { cliente_cpf: { contains: search } },
        { id: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Erro ao listar pedidos no admin:', error);
    return NextResponse.json({ error: 'Erro ao listar pedidos' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = requireAdminAuth(req);
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado. Autenticação administrativa necessária.' }, { status: 403 });
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'ID do pedido e status são obrigatórios' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: String(orderId) },
      data: { status: status as OrderStatus },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 });
  }
}
