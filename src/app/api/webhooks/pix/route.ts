import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('🔔 Webhook PIX recebido:', JSON.stringify(body));

    const paymentId = body.data?.id || body.paymentId || body.id;
    const orderId = body.orderId;

    if (orderId) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      });

      return NextResponse.json({ success: true, message: `Pedido ${orderId} marcado como PAGO.`, order });
    }

    if (paymentId) {
      const order = await prisma.order.findFirst({
        where: { gateway_payment_id: String(paymentId) },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PAID' },
        });
        return NextResponse.json({ success: true, message: `Pedido ${order.id} pago via Webhook Mercado Pago.` });
      }
    }

    return NextResponse.json({ message: 'Webhook processado (sem vinculação direta encontrada)' });
  } catch (error) {
    console.error('Erro no webhook PIX:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
