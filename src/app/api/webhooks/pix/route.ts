import { prisma } from '@/lib/prisma';
import { sendAdminOrderNotification, sendCustomerOrderConfirmation } from '@/lib/email';

export const dynamic = 'force-dynamic';

async function processPaymentNotification(paymentId: string) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim().replace(/^["']|["']$/g, '');

  if (!token) {
    console.error('❌ Webhook Mercado Pago: MERCADO_PAGO_ACCESS_TOKEN não configurado no ambiente.');
    return;
  }

  try {
    // 1. Consultar dados oficiais do pagamento diretamente na API do Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!mpRes.ok) {
      console.error(`❌ Erro ao consultar pagamento Mercado Pago ID ${paymentId}: status HTTP ${mpRes.status}`);
      return;
    }

    const mpData = await mpRes.json();
    const paymentStatus = mpData.status; // 'approved', 'pending', etc.
    const externalReference = mpData.external_reference;

    console.log(`🔔 Webhook Mercado Pago: Notificação de Pagamento ${paymentId} - Status: ${paymentStatus}`);

    if (paymentStatus === 'approved') {
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
        // Atualizar status apenas se ainda não estiver pago
        if (order.status !== 'PAID') {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'PAID' },
          });

          console.log(`✅ SUCESSO WEBHOOK: Pedido #${order.id} marcado como PAGO no banco MySQL!`);

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

          sendAdminOrderNotification(emailPayload).catch((e) => console.error('Erro ao enviar e-mail admin:', e));
          sendCustomerOrderConfirmation(emailPayload).catch((e) => console.error('Erro ao enviar e-mail cliente:', e));
        }
      } else {
        console.warn(`⚠️ Webhook: Nenhum pedido associado encontrado para a transação ID ${paymentId}`);
      }
    }
  } catch (err) {
    console.error('❌ Erro no processamento da notificação Mercado Pago:', err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const paymentId = body.data?.id || body.paymentId || body.id;

    if (paymentId) {
      await processPaymentNotification(String(paymentId));
    }

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
