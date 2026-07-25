import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function processPaymentNotification(paymentId: string) {
  const rawToken = 
    process.env.MERCADO_PAGO_ACCESS_TOKEN || 
    process.env.NEXT_PUBLIC_MERCADO_PAGO_ACCESS_TOKEN || 
    'APP_USR-6903860235338291-072514-c174c19118dd2289d79b7030f5d9d007-1353511502';

  const token = rawToken ? rawToken.trim().replace(/^["']|["']$/g, '') : '';

  if (!token) {
    console.error('❌ Webhook Mercado Pago: Token não configurado.');
    return;
  }

  try {
    // 1. Consultar dados do pagamento na API oficial do Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!mpRes.ok) {
      console.error(`❌ Erro ao consultar pagamento Mercado Pago ID ${paymentId}: status ${mpRes.status}`);
      return;
    }

    const mpData = await mpRes.json();
    const paymentStatus = mpData.status; // 'approved', 'pending', etc.
    const externalReference = mpData.external_reference;

    console.log(`🔔 Webhook Mercado Pago: Notificação de Pagamento ${paymentId} - Status: ${paymentStatus}`);

    if (paymentStatus === 'approved') {
      // 2. Buscar o pedido correspondente por external_reference ou gateway_payment_id
      let order = await prisma.order.findFirst({
        where: {
          OR: [
            ...(externalReference ? [{ id: externalReference }] : []),
            { gateway_payment_id: String(paymentId) },
          ],
        },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PAID' },
        });
        console.log(`✅ SUCESSO WEBHOOK: Pedido #${order.id} marcado como PAGO no banco MySQL!`);
      } else {
        console.warn(`⚠️ Webhook: Nenhum pedido encontrado para a transação Mercado Pago ID ${paymentId}`);
      }
    }
  } catch (err) {
    console.error('❌ Erro no processamento da notificação Mercado Pago:', err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log('🔔 Webhook POST recebido:', JSON.stringify(body));

    const paymentId = body.data?.id || body.paymentId || body.id;
    const directOrderId = body.orderId;

    if (directOrderId) {
      await prisma.order.update({
        where: { id: directOrderId },
        data: { status: 'PAID' },
      }).catch(() => {});
      return new Response("OK", { status: 200 });
    }

    if (paymentId) {
      await processPaymentNotification(String(paymentId));
    }

    // Sempre retornar status HTTP 200 para confirmação da notificação do Mercado Pago
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error('Erro no handler POST do webhook:', error);
    return new Response("OK", { status: 200 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get('id') || searchParams.get('data.id');

  if (paymentId) {
    await processPaymentNotification(String(paymentId));
  }

  return new Response("OK", { status: 200 });
}
