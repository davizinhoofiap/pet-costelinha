import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tokenCookie = cookies().get('token')?.value;
    const user = tokenCookie ? verifyToken(tokenCookie) : null;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas usuários com perfil ADMIN podem visualizar relatórios financeiros.' },
        { status: 403 }
      );
    }

    // 1. Faturamento Bruto Total (Pedidos PAGOS ou EM SEPARAÇÃO ou ENTREGUES)
    const paidOrders = await prisma.order.findMany({
      where: {
        status: { in: ['PAID', 'PROCESSING', 'DELIVERED'] },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    let faturamentoBruto = 0;
    let lucroBrutoEstimado = 0;

    for (const order of paidOrders) {
      faturamentoBruto += Number(order.total_valor);

      for (const item of order.items) {
        const precoVenda = Number(item.preco_unitario);
        const precoCusto = Number(item.product.preco_custo);
        const margemPorItem = precoVenda - precoCusto;
        lucroBrutoEstimado += margemPorItem * item.quantidade;
      }
    }

    const totalPedidos = await prisma.order.count();
    const totalPedidosPagos = paidOrders.length;
    const ticketMedio = totalPedidosPagos > 0 ? faturamentoBruto / totalPedidosPagos : 0;
    const totalProdutos = await prisma.product.count();

    return NextResponse.json({
      faturamentoBruto,
      lucroBrutoEstimado,
      totalPedidos,
      totalPedidosPagos,
      ticketMedio,
      totalProdutos,
    });
  } catch (error) {
    console.error('Erro ao gerar métricas financeiras:', error);
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  }
}
