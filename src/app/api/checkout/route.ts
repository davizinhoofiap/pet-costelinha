import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateCPF } from '@/lib/cpf';
import { createPixPayment } from '@/lib/pix';
import { sendCustomerOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';
import { getClientIp } from '@/lib/rate-limit';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { checkRateLimit } from '@/lib/upstash-ratelimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // 1. Rate Limiting com Upstash Redis + Memory Fallback (10 solicitações / 300s por IP)
    const rateCheck = await checkRateLimit(`checkout:${ip}`, 10, 300);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Muitas solicitações de checkout. Por favor, aguarde alguns minutos antes de tentar novamente.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { clienteNome, clienteEmail, clienteCpf, clienteTelefone, enderecoEntrega, items, metodoPagamento, turnstileToken } = body;

    // 2. Validação Anti-Bot do Cloudflare Turnstile (resiliente para mobile/dev)
    if (turnstileToken) {
      const turnstileCheck = await verifyTurnstileToken(turnstileToken, ip);
      if (!turnstileCheck.success) {
        return NextResponse.json(
          { error: turnstileCheck.message || 'Validação Anti-Bot do Turnstile falhou. Tente novamente.' },
          { status: 400 }
        );
      }
    }

    // 3. Validação de campos obrigatórios
    if (!clienteNome || !clienteEmail || !clienteCpf || !enderecoEntrega || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Todos os campos de cadastro, endereço e itens são obrigatórios.' }, { status: 400 });
    }

    // 4. Validação Algorítmica Real do CPF
    if (!validateCPF(clienteCpf)) {
      return NextResponse.json(
        { error: 'O CPF informado é inválido. Por favor, verifique os dígitos e tente novamente.' },
        { status: 400 }
      );
    }

    // 5. Buscar produtos no banco e recalcular total seguro
    const productIds = items.map((i: any) => String(i.productId || i.id));
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let totalCalculado = 0;
    const orderItemsData = [];
    const emailItems = [];

    for (const item of items) {
      const targetId = String(item.productId || item.id);
      const quantidadeNum = parseInt(item.quantidade, 10);
      if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
        return NextResponse.json({ error: 'Quantidade inválida para o produto.' }, { status: 400 });
      }

      const prod = dbProducts.find((p) => p.id === targetId);
      if (!prod) {
        return NextResponse.json({ error: `Produto não localizado no estoque.` }, { status: 400 });
      }

      if (prod.estoque < quantidadeNum) {
        return NextResponse.json({ error: `Estoque insuficiente para o produto ${prod.nome}. Disponível: ${prod.estoque}` }, { status: 400 });
      }

      const precoUnit = Number(prod.preco_venda);
      const subtotal = precoUnit * quantidadeNum;
      totalCalculado += subtotal;

      orderItemsData.push({
        product_id: prod.id,
        quantidade: quantidadeNum,
        preco_unitario: precoUnit,
      });

      emailItems.push({
        nome: prod.nome,
        quantidade: quantidadeNum,
        precoUnitario: precoUnit,
      });
    }

    if (totalCalculado < 1.00) {
      totalCalculado = 1.00;
    }

    // 6. Criar Pedido no Banco de Dados Aiven Cloud
    const newOrder = await prisma.order.create({
      data: {
        cliente_nome: String(clienteNome).trim(),
        cliente_email: String(clienteEmail).toLowerCase().trim(),
        cliente_cpf: String(clienteCpf).replace(/\D/g, ''),
        cliente_telefone: clienteTelefone ? String(clienteTelefone).trim() : null,
        endereco_entrega: String(enderecoEntrega).trim(),
        total_valor: totalCalculado,
        status: 'PENDING',
        metodo_pagamento: metodoPagamento || 'PIX',
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // 7. Baixa no estoque
    for (const item of items) {
      const targetId = String(item.productId || item.id);
      const quantidadeNum = parseInt(item.quantidade, 10);
      await prisma.product.update({
        where: { id: targetId },
        data: { estoque: { decrement: quantidadeNum } },
      });
    }

    // 8. Processar Pagamento PIX via Mercado Pago se aplicável
    let pixData = null;
    if (metodoPagamento !== 'WHATSAPP') {
      try {
        pixData = await createPixPayment(
          newOrder.id,
          totalCalculado,
          clienteEmail,
          clienteNome,
          clienteCpf
        );

        if (pixData) {
          await prisma.order.update({
            where: { id: newOrder.id },
            data: {
              gateway_payment_id: pixData.paymentId,
              qr_code_pix: pixData.qrCode,
              qr_code_base64: pixData.qrCodeBase64,
            },
          });
        }
      } catch (pixErr: any) {
        console.error('⚠️ Falha ao gerar PIX Mercado Pago no gateway:', pixErr);
        // Em caso de instabilidade no gateway Mercado Pago, não trava o pedido: responde com orderId gravada
      }
    }

    // 9. Disparar E-mails Transacionais de forma assíncrona
    const emailPayload = {
      orderId: newOrder.id,
      clienteNome,
      clienteEmail,
      clienteCpf,
      enderecoEntrega,
      totalValor: totalCalculado,
      items: emailItems,
      status: 'PENDING',
    };

    sendCustomerOrderConfirmation(emailPayload).catch((e) => console.error('Erro e-mail cliente:', e));
    sendAdminOrderNotification(emailPayload).catch((e) => console.error('Erro e-mail admin:', e));

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      total: totalCalculado,
      pix: pixData,
    });
  } catch (error: any) {
    console.error('❌ Erro no processamento do checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar o pedido no servidor. Por favor, tente novamente.' },
      { status: 500 }
    );
  }
}
