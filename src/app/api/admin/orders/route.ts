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

    const body = await req.json();
    const { orderId, status, cliente_nome, cliente_email, cliente_telefone, endereco_entrega } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'ID do pedido é obrigatório' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status as OrderStatus;
    if (cliente_nome !== undefined) updateData.cliente_nome = cliente_nome;
    if (cliente_email !== undefined) updateData.cliente_email = cliente_email;
    if (cliente_telefone !== undefined) updateData.cliente_telefone = cliente_telefone;
    if (endereco_entrega !== undefined) updateData.endereco_entrega = endereco_entrega;

    const updatedOrder = await prisma.order.update({
      where: { id: String(orderId) },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = requireAdminAuth(req);
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado. Autenticação administrativa necessária.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const orderIdsParam = searchParams.get('orderIds');

    let idsToDelete: string[] = [];

    if (orderId) {
      idsToDelete.push(orderId);
    } else if (orderIdsParam) {
      idsToDelete = orderIdsParam.split(',').filter(Boolean);
    } else {
      const body = await req.json().catch(() => ({}));
      if (Array.isArray(body.orderIds) && body.orderIds.length > 0) {
        idsToDelete = body.orderIds;
      }
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: 'Selecione pelo menos um pedido para exclusão.' }, { status: 400 });
    }

    const result = await prisma.order.deleteMany({
      where: {
        id: { in: idsToDelete },
      },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} pedido(s) excluído(s) do banco de dados com sucesso.`,
    });
  } catch (error) {
    console.error('Erro ao excluir pedidos:', error);
    return NextResponse.json({ error: 'Erro ao excluir pedidos do banco de dados.' }, { status: 500 });
  }
}
