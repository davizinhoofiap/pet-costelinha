const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCheckout() {
  try {
    const prod = await prisma.product.findFirst();
    if (!prod) {
      console.log('Nenhum produto no banco');
      return;
    }
    console.log('Produto encontrado:', prod.id, prod.nome, prod.preco_venda);

    const newOrder = await prisma.order.create({
      data: {
        cliente_nome: 'Teste Davi',
        cliente_email: 'davizinhotimao47@gmail.com',
        cliente_cpf: '11144477735',
        cliente_telefone: '(11) 98765-4321',
        endereco_entrega: 'Rua Teste, 123',
        total_valor: Number(prod.preco_venda),
        status: 'PENDING',
        metodo_pagamento: 'PIX',
        items: {
          create: [
            {
              product_id: prod.id,
              quantidade: 1,
              preco_unitario: Number(prod.preco_venda)
            }
          ]
        }
      }
    });

    console.log('✅ Order criada com sucesso no Aiven MySQL:', newOrder.id);
  } catch (err) {
    console.error('❌ Erro no Prisma Order Test:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testCheckout();
