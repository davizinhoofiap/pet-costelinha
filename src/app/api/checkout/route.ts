import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateCPF } from '@/lib/cpf';
import { createPixPayment } from '@/lib/pix';
import { sendCustomerOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clienteNome, clienteEmail, clienteCpf, enderecoEntrega, items, metodoPagamento } = body;

    // 1. Validação de campos obrigatórios
    if (!clienteNome || !clienteEmail || !clienteCpf || !enderecoEntrega || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Todos os campos de cadastro, endereço e itens são obrigatórios.' }, { status: 400 });
    }

    // 2. Validação Algorítmica Real do CPF
    if (!validateCPF(clienteCpf)) {
      return NextResponse.json(
        { error: 'O CPF informado é inválido. Por favor, verifique os dígitos e tente novamente.' },
        { status: 400 }
      );
    }

    // 3. Buscar produtos no banco e recalcular total seguro
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let totalCalculado = 0;
    const orderItemsData = [];
    const emailItems = [];

    for (const item of items) {
      const prod = dbProducts.find((p) => p.id === item.productId);
      if (!prod) {
        return NextResponse.json({ error: `Produto ID ${item.productId} não foi encontrado no estoque.` }, { status: 400 });
      }

      if (prod.estoque < item.quantidade) {
        return NextResponse.json({ error: `Estoque insuficiente para o produto ${prod.nome}. Disponível: ${prod.estoque}` }, { status: 400 });
      }

      const precoUnit = Number(prod.preco_venda);
      const subtotal = precoUnit * item.quantidade;
      totalCalculado += subtotal;

      orderItemsData.push({
        product_id: prod.id,
        quantidade: item.quantidade,
        preco_unitario: precoUnit,
      });

      emailItems.push({
        nome: prod.nome,
        quantidade: item.quantidade,
        precoUnitario: precoUnit,
      });
    }

    // Garantir valor mínimo de R$ 1,00 para os testes de mercado do PIX
    if (totalCalculado < 1.00) {
      totalCalculado = 1.00;
    }

    // 4. Criar Pedido no MySQL
    const newOrder = await prisma.order.create({
      data: {
        cliente_nome: clienteNome,
        cliente_email: clienteEmail,
        cliente_cpf: clienteCpf,
        endereco_entrega: enderecoEntrega,
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

    // 5. Baixa de estoque
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { estoque: { decrement: item.quantidade } },
      });
    }

    // 6. Processar Pagamento PIX se aplicável
    let pixData = null;
    if (metodoPagamento !== 'WHATSAPP') {
      pixData = await createPixPayment(
        newOrder.id,
        totalCalculado,
        clienteEmail,
        clienteNome,
        clienteCpf
      );

      // Atualizar pedido com IDs do gateway e QR Code
      await prisma.order.update({
        where: { id: newOrder.id },
        data: {
          gateway_payment_id: pixData.paymentId,
          qr_code_pix: pixData.qrCode,
          qr_code_base64: pixData.qrCodeBase64,
        },
      });
    }

    // 7. Disparar E-mails Transacionais de forma assíncrona
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
      {
        error: error.message || 'Erro ao processar o pedido no servidor',
        details: error.toString(),
      },
      { status: 400 }
    );
  }
}
