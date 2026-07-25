import { prisma } from '@/lib/prisma';
import { sendAdminOrderNotification, sendCustomerOrderConfirmation } from '@/lib/email';

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
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (order) {
        // Atualizar status para PAID no MySQL
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PAID' },
        });

        console.log(`✅ SUCESSO WEBHOOK: Pedido #${order.id} marcado como PAGO no banco MySQL!`);

        // Disparar e-mails de notificação automática para o Gerente / Atendentes e Cliente
        const emailPayload = {
          orderId: order.id,
          clienteNome: order.cliente_nome,
          clienteEmail: order.cliente_email,
          clienteCpf: order.cliente_cpf,
          clienteTelefone: order.cliente_telefone || 'Não Informado',
          enderecoEntrega: order.endereco_entrega,
          totalValor: Number(order.total_valor),
          items: order.items.map((i) => ({
            nome: i.product?.nome || 'Produto Pet',
            quantidade: i.quantidade,
            precoUnitario: Number(i.preco_unitario),
          })),
          status: 'PAID',
        };

        // Envio assíncrono para gerente e cliente
        sendAdminOrderNotification(emailPayload).catch((e) => console.error('Erro ao enviar e-mail admin:', e));
        sendCustomerOrderConfirmation(emailPayload).catch((e) => console.error('Erro ao enviar e-mail cliente:', e));
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
