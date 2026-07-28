import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { sendOrderEmail } from '@/lib/email';
import { createPixPayment } from '@/lib/pix';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clienteNome,
      clienteEmail,
      clienteCpf,
      clienteTelefone,
      enderecoEntrega,
      metodoPagamento = 'PIX',
      items,
      turnstileToken,
    } = body;

    // 1. Validação do Anti-bot Turnstile do Cloudflare (Com resiliência a keys de teste e mobile)
    const isTurnstileValid = await verifyTurnstileToken(turnstileToken);
    if (!isTurnstileValid) {
      return NextResponse.json(
        { error: 'Falha na verificação de segurança anti-bot (Cloudflare Turnstile).' },
        { status: 400 }
      );
    }

    // 2. Validação básica de campos obrigatórios do comprador
    if (!clienteNome || !clienteEmail || !clienteCpf || !enderecoEntrega || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios (Nome, E-mail, CPF, Endereço e Itens) devem ser preenchidos.' },
        { status: 400 }
      );
    }

    // 3. Buscar produtos no banco de dados para recalcular preço e verificar estoque com segurança
    const itemIds = items.map((i: any) => String(i.productId || i.id));
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: itemIds } },
    });

    if (dbProducts.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum produto válido foi encontrado para realizar o pedido.' },
        { status: 400 }
      );
    }

    // Map para busca ultra rápida por ID
    const dbProductsMap = new Map(dbProducts.map((p) => [p.id, p]));

    let totalCalculado = 0;
    const orderItemsToCreate = [];
    const emailItems = [];

    // 4. Validar estoque e calcular total
    for (const item of items) {
      const targetId = String(item.productId || item.id);
      const product = dbProductsMap.get(targetId);

      if (!product) {
        return NextResponse.json(
          { error: `Produto ID ${targetId} não foi encontrado no catálogo da loja.` },
          { status: 400 }
        );
      }

      const quantidadeNum = parseInt(item.quantidade, 10);

      if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
        return NextResponse.json(
          { error: `Quantidade inválida para o produto ${product.nome}.` },
          { status: 400 }
        );
      }

      if (product.estoque < quantidadeNum) {
        return NextResponse.json(
          { error: `Estoque insuficiente para o produto "${product.nome}". Disponível: ${product.estoque}` },
          { status: 400 }
        );
      }

      const precoUnitario = Number(product.preco_venda);
      const itemSubtotal = precoUnitario * quantidadeNum;
      totalCalculado += itemSubtotal;

      orderItemsToCreate.push({
        product_id: product.id,
        quantidade: quantidadeNum,
        preco_unitario: precoUnitario,
      });

      emailItems.push({
        nome: product.nome,
        quantidade: quantidadeNum,
        precoUnitario: precoUnitario,
        subtotal: itemSubtotal,
      });
    }

    // 5. Garantir limite mínimo de R$ 1.00 para pagamento PIX Mercado Pago
    if (totalCalculado < 1.00) {
      return NextResponse.json(
        { error: 'O valor total mínimo para pagamento via PIX é de R$ 1,00.' },
        { status: 400 }
      );
    }

    // 6. Criar o pedido no banco de dados com status PENDING
    const newOrder = await prisma.order.create({
      data: {
        cliente_nome: clienteNome,
        cliente_email: clienteEmail,
        cliente_cpf: clienteCpf,
        cliente_telefone: clienteTelefone || null,
        endereco_entrega: enderecoEntrega,
        total_valor: totalCalculado,
        metodo_pagamento: metodoPagamento,
        status: 'PENDING',
        items: {
          create: orderItemsToCreate,
        },
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
        const errorMsg = pixErr.message || 'Falha ao conectar com o gateway do Mercado Pago';
        console.error('ERRO MERCADO PAGO:', JSON.stringify({ error: errorMsg, orderId: newOrder.id }, null, 2));

        if (metodoPagamento === 'PIX') {
          return NextResponse.json(
            {
              success: false,
              error: `Mercado Pago: ${errorMsg}`,
              orderId: newOrder.id,
            },
            { status: 400 }
          );
        }
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

    sendOrderEmail(emailPayload).catch((emailErr) => {
      console.error('⚠️ Falha no envio assíncrono do e-mail de pedido:', emailErr);
    });

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      total: totalCalculado,
      pix: pixData,
    });
  } catch (error: any) {
    console.error('❌ Erro no processamento de checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Ocorreu um erro interno ao processar o seu pedido.' },
      { status: 500 }
    );
  }
}
