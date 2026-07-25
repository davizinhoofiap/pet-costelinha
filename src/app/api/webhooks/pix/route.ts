import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function processPaymentNotification(paymentId: string) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token || token.startsWith('APP_USR-0000000000000000')) {
    return { success: false, reason: 'Token do Mercado Pago não configurado.' };
  }

  try {
    // 1. Consultar dados do pagamento na API oficial do Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!mpRes.ok) {
      console.error(`❌ Erro ao consultar pagamento Mercado Pago ID ${paymentId}:`, mpRes.status);
      return { success: false, reason: 'Pagamento não encontrado na API do Mercado Pago' };
    }

    const mpData = await mpRes.json();
    const paymentStatus = mpData.status; // 'approved', 'pending', 'cancelled', etc.
    const externalReference = mpData.external_reference;

    console.log(`🔔 Webhook Mercado Pago: Pagamento ${paymentId} - Status: ${paymentStatus}`);

    if (paymentStatus === 'approved') {
      // 2. Buscar o pedido correspondente por gateway_payment_id ou external_reference
      let order = await prisma.order.findFirst({
        where: {
          OR: [
            { gateway_payment_id: String(paymentId) },
            ...(externalReference ? [{ id: externalReference }] : []),
          ],
        },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PAID' },
        });
        console.log(`✅ Pedido #${order.id} atualizado para PAGO via Webhook Mercado Pago!`);
        return { success: true, message: `Pedido ${order.id} marcado como PAGO.`, orderId: order.id };
      } else {
        console.warn(`⚠️ Nenhum pedido encontrado no banco MySQL para a transação ${paymentId}`);
      }
    }

    return { success: true, status: paymentStatus };
  } catch (err) {
    console.error('❌ Erro no processamento da notificação Mercado Pago:', err);
    return { success: false, error: String(err) };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log('🔔 Webhook POST recebido:', JSON.stringify(body));

    const paymentId = body.data?.id || body.paymentId || body.id;
    const directOrderId = body.orderId;

    if (directOrderId) {
      const order = await prisma.order.update({
        where: { id: directOrderId },
        data: { status: 'PAID' },
      });
      return NextResponse.json({ success: true, message: `Pedido ${directOrderId} marcado como PAGO.`, order });
    }

    if (paymentId) {
      const result = await processPaymentNotification(String(paymentId));
      return NextResponse.json(result);
    }

    return NextResponse.json({ message: 'Notificação recebida com sucesso' });
  } catch (error) {
    console.error('Erro no webhook PIX:', error);
    return NextResponse.json({ error: 'Erro interno ao processar webhook' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get('id') || searchParams.get('data.id');

  if (paymentId) {
    const result = await processPaymentNotification(String(paymentId));
    return NextResponse.json(result);
  }

  return NextResponse.json({ message: 'Webhook GET endpoint ativo' });
}
