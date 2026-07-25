import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json({ error: 'ID do pedido é obrigatório' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        total_valor: true,
        metodo_pagamento: true,
        created_at: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: order.status,
      order,
    });
  } catch (error) {
    console.error('Erro ao consultar status do pedido:', error);
    return NextResponse.json({ error: 'Erro interno ao consultar pedido' }, { status: 500 });
  }
}
