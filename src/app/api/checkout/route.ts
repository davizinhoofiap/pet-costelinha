import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPixPayment } from '@/lib/pix';
import { sendOrderEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/upstash-ratelimit';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { getClientIp } from '@/lib/rate-limit';
import { checkoutSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const startTime = performance.now();

  try {
    const ip = getClientIp(req);

    // 1. Protection Rate Limit (Anti-DDoS & Bot Mitigation: 5 checkouts / 60s por IP)
    const rateCheck = await checkRateLimit(`checkout:${ip}`, 5, 60);
    if (!rateCheck.success) {
      logger.warn('⚠️ Rate limit de checkout excedido', { requestId, clientIp: ip });
      return NextResponse.json(
        { success: false, error: 'Muitas tentativas de compra em curto período. Por favor, aguarde 1 minuto.' },
        { status: 429, headers: { 'X-Request-ID': requestId } }
      );
    }

    const body = await req.json();

    // 2. Validação Rígida & Sanitização com Zod
    const parseResult = checkoutSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Dados inválidos fornecidos no pedido.';
      logger.warn('Falha na validação Zod do checkout', { requestId, validationError: firstError });
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }

    const {
      clienteNome,
      clienteEmail,
      clienteCpf,
      clienteTelefone,
      enderecoEntrega,
      metodoPagamento,
      items,
      turnstileToken,
    } = parseResult.data;

    // 3. Validação Anti-Bot Cloudflare Turnstile
    if (turnstileToken) {
      const turnstileCheck = await verifyTurnstileToken(turnstileToken, ip);
      if (!turnstileCheck.success) {
        logger.warn('Validação Turnstile anti-bot falhou no checkout', { requestId, clientIp: ip });
        return NextResponse.json(
          { success: false, error: turnstileCheck.message || 'Validação Anti-Bot do Turnstile falhou.' },
          { status: 400, headers: { 'X-Request-ID': requestId } }
        );
      }
    }

    // 4. Consulta dos Produtos e Cálculo do Subtotal com Medição de Performance
    const productIds = items.map((i) => i.productId);
    const dbProducts = await logger.measureTime('Checkout.fetchProductsDB', async () => {
      return prisma.product.findMany({
        where: { id: { in: productIds } },
      });
    }, { requestId, productCount: productIds.length });

    if (dbProducts.length !== items.length) {
      logger.warn('Produtos no carrinho não foram encontrados no banco', { requestId });
      return NextResponse.json(
        { success: false, error: 'Um ou mais produtos do seu carrinho não foram encontrados.' },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }

    let calculatedTotal = 0;
    const orderItemsData = items.map((item) => {
      const prod = dbProducts.find((p) => p.id === item.productId)!;
      const rawPrice = Number(prod.preco_venda);
      const unitPrice = isNaN(rawPrice) ? 0 : rawPrice;
      calculatedTotal += unitPrice * item.quantidade;

      return {
        product_id: prod.id,
        quantidade: item.quantidade,
        preco_unitario: unitPrice,
      };
    });

    if (calculatedTotal < 1.00 && metodoPagamento === 'PIX') {
      return NextResponse.json(
        { success: false, error: 'O valor mínimo para pagamento via PIX no Mercado Pago é de R$ 1,00.' },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }

    // 5. Vincular ao perfil de Usuário existente (se houver)
    const existingUser = await prisma.user.findUnique({
      where: { email: clienteEmail },
    });

    // 6. Gravar Pedido no Banco de Dados via Transação Prisma
    const newOrder = await logger.measureTime('Checkout.createOrderDB', async () => {
      return prisma.order.create({
        data: {
          user_id: existingUser ? existingUser.id : null,
          cliente_nome: clienteNome,
          cliente_email: clienteEmail,
          cliente_cpf: clienteCpf,
          cliente_telefone: clienteTelefone,
          endereco_entrega: enderecoEntrega,
          total_valor: calculatedTotal,
          metodo_pagamento: metodoPagamento,
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    }, { requestId, totalCalculado: calculatedTotal });

    logger.info('Pedido registrado com sucesso no banco', { requestId, orderId: newOrder.id });

    // 7. Processar PIX via SDK do Mercado Pago
    let pixData: { qrCode: string; qrCodeBase64: string; paymentId: string } | null = null;

    if (metodoPagamento === 'PIX') {
      try {
        pixData = await logger.measureTime('Checkout.createPixPayment', async () => {
          return createPixPayment(
            newOrder.id,
            calculatedTotal,
            clienteEmail,
            clienteNome,
            clienteCpf
          );
        }, { requestId, orderId: newOrder.id });

        if (pixData?.paymentId) {
          await prisma.order.update({
            where: { id: newOrder.id },
            data: {
              gateway_payment_id: pixData.paymentId,
              qr_code_pix: pixData.qrCode,
              qr_code_base64: pixData.qrCodeBase64,
            },
          });
        }
      } catch (mpError: any) {
        logger.error('Erro na integração do Mercado Pago PIX', {
          requestId,
          orderId: newOrder.id,
          errorMessage: mpError.message || String(mpError),
        });
        // Mantém pixData como null para que o modal utilize o fallback de chave celular se necessário
      }
    }

    // 8. Disparo Assíncrono de E-mail de Confirmação (Não Bloqueante)
    try {
      sendOrderEmail({
        orderId: newOrder.id,
        clienteNome,
        clienteEmail,
        clienteCpf,
        clienteTelefone,
        enderecoEntrega,
        totalValor: calculatedTotal,
        status: 'PENDING',
        items: newOrder.items.map((i) => ({
          nome: i.product.nome,
          quantidade: i.quantidade,
          precoUnitario: Number(i.preco_unitario),
        })),
      }).catch((emailErr) => {
        logger.error('Erro ao enviar e-mail de confirmação de pedido', { requestId, error: emailErr.message });
      });
    } catch (e) {}

    const durationMs = Math.round(performance.now() - startTime);

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      total: calculatedTotal,
      pix: pixData,
      execution_time_ms: durationMs,
    }, {
      headers: { 'X-Request-ID': requestId },
    });
  } catch (error: any) {
    const durationMs = Math.round(performance.now() - startTime);
    logger.error('Erro no processamento da rota de checkout', {
      requestId,
      execution_time_ms: durationMs,
      error: error.message || String(error),
    });

    return NextResponse.json(
      { success: false, error: 'Ocorreu um erro interno ao processar o seu pedido. Tente novamente.' },
      { status: 500, headers: { 'X-Request-ID': requestId } }
    );
  }
}
