import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Buscar apenas pedidos não lidos (lido: false) para a contagem oficial do badge
    const unreadOrders = await prisma.order.findMany({
      where: {
        status: { in: ['PAID', 'PROCESSING'] },
        lido: false,
      },
      orderBy: { created_at: 'desc' },
      take: 20,
      select: {
        id: true,
        cliente_nome: true,
        cliente_cpf: true,
        total_valor: true,
        status: true,
        lido: true,
        created_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: unreadOrders.length,
      unreadCount: unreadOrders.length,
      notifications: unreadOrders,
    });
  } catch (error) {
    console.error('Erro na central de notificações de pedidos:', error);
    return NextResponse.json({ error: 'Erro ao consultar notificações' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { orderId } = body;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { lido: true },
      });
    } else {
      // Marcar TODAS as notificações ativas como lidas no banco de dados
      await prisma.order.updateMany({
        where: {
          lido: false,
        },
        data: { lido: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
    return NextResponse.json({ error: 'Erro ao atualizar notificações' }, { status: 500 });
  }
}
