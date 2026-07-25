import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('categoria');
    const search = searchParams.get('busca');
    const maxPrice = searchParams.get('preco_max');
    const featured = searchParams.get('destaque');

    const where: any = {};

    if (categorySlug) {
      where.categoria = { slug: categorySlug };
    }

    if (search) {
      where.OR = [
        { nome: { contains: search } },
        { descricao: { contains: search } },
      ];
    }

    if (maxPrice) {
      where.preco_venda = { lte: parseFloat(maxPrice) };
    }

    if (featured === 'true') {
      where.destaque = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        categoria: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 });
  }
}
