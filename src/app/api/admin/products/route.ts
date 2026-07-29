import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const admin = requireAdminAuth(req);
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado. Autenticação administrativa necessária.' }, { status: 403 });
    }

    const body = await req.json();
    const { nome, descricao, preco_custo, preco_venda, estoque, categoria_id, imagem_url, destaque } = body;

    if (!nome || preco_custo === undefined || preco_venda === undefined || !categoria_id) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    const costNum = parseFloat(preco_custo);
    const sellNum = parseFloat(preco_venda);
    const stockNum = parseInt(estoque || '0', 10);

    if (isNaN(costNum) || costNum < 0 || isNaN(sellNum) || sellNum < 0 || isNaN(stockNum) || stockNum < 0) {
      return NextResponse.json({ error: 'Valores de preço e estoque devem ser números positivos.' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        nome: String(nome).trim(),
        descricao: descricao ? String(descricao).trim() : '',
        preco_custo: costNum,
        preco_venda: sellNum,
        estoque: stockNum,
        categoria_id: String(categoria_id),
        imagem_url: imagem_url ? String(imagem_url).trim() : 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80',
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
    const admin = requireAdminAuth(req);
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado. Autenticação administrativa necessária.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, nome, descricao, preco_custo, preco_venda, estoque, categoria_id, imagem_url, destaque } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

    const costNum = parseFloat(preco_custo);
    const sellNum = parseFloat(preco_venda);
    const stockNum = parseInt(estoque, 10);

    if (isNaN(costNum) || costNum < 0 || isNaN(sellNum) || sellNum < 0 || isNaN(stockNum) || stockNum < 0) {
      return NextResponse.json({ error: 'Valores de preço e estoque devem ser números positivos.' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: String(id) },
      data: {
        nome: String(nome).trim(),
        descricao: descricao ? String(descricao).trim() : '',
        preco_custo: costNum,
        preco_venda: sellNum,
        estoque: stockNum,
        categoria_id: String(categoria_id),
        imagem_url: imagem_url ? String(imagem_url).trim() : undefined,
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
    const admin = requireAdminAuth(req);
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado. Autenticação administrativa necessária.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const productIdsParam = searchParams.get('productIds');

    let idsToDelete: string[] = [];

    if (id) {
      idsToDelete.push(id);
    } else if (productIdsParam) {
      idsToDelete = productIdsParam.split(',').filter(Boolean);
    } else {
      const body = await req.json().catch(() => ({}));
      if (Array.isArray(body.productIds) && body.productIds.length > 0) {
        idsToDelete = body.productIds;
      }
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: 'ID ou lista de produtos é obrigatória' }, { status: 400 });
    }

    const result = await prisma.product.deleteMany({
      where: { id: { in: idsToDelete } },
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Erro ao excluir produtos:', error);
    return NextResponse.json({ error: 'Erro ao excluir produto(s) do banco de dados.' }, { status: 500 });
  }
}
