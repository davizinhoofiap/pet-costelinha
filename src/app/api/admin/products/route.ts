import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, descricao, preco_custo, preco_venda, estoque, categoria_id, imagem_url, destaque } = body;

    if (!nome || !preco_custo || !preco_venda || !categoria_id) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        nome,
        descricao: descricao || '',
        preco_custo: parseFloat(preco_custo),
        preco_venda: parseFloat(preco_venda),
        estoque: parseInt(estoque || '0', 10),
        categoria_id,
        imagem_url: imagem_url || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80',
        destaque: Boolean(destaque),
      },
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar produto' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, nome, descricao, preco_custo, preco_venda, estoque, categoria_id, imagem_url, destaque } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        nome,
        descricao,
        preco_custo: parseFloat(preco_custo),
        preco_venda: parseFloat(preco_venda),
        estoque: parseInt(estoque, 10),
        categoria_id,
        imagem_url,
        destaque: Boolean(destaque),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Erro ao editar produto:', error);
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 });
  }
}
