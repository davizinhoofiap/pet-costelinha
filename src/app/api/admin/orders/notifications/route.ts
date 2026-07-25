import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Buscar os últimos 10 pedidos que foram pagos (PAID) para notificação na central
    const recentPaidOrders = await prisma.order.findMany({
      where: {
        status: { in: ['PAID', 'PROCESSING'] },
      },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        cliente_nome: true,
        cliente_cpf: true,
        total_valor: true,
        status: true,
        created_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: recentPaidOrders.length,
      notifications: recentPaidOrders,
    });
  } catch (error) {
    console.error('Erro na central de notificações de pedidos:', error);
    return NextResponse.json({ error: 'Erro ao consultar notificações' }, { status: 500 });
  }
}
