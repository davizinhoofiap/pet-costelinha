import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inicializando cadastro de produtos reais do Pet Costelinha (Loja Comercial)...');

  // Limpar tabelas mantendo integridade
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSetting.deleteMany();

  // 1. Criar Configurações da Loja
  await prisma.storeSetting.create({
    data: {
      nome_loja: 'Pet Costelinha',
      slogan: 'Loja completa de rações, medicamentos, produtos de higiene e acessórios pet',
      telefone: '(11) 5197-1916',
      whatsapp: '51971916',
      email_suporte: 'contato@petcostelinha.com.br',
      endereco: 'Rua Benigno Nogueira Franco, 367 - Jd. das Oliveras, SP',
      cnpj: '12.345.678/0001-90',
      chave_pix: 'contato@petcostelinha.com.br',
    },
  });

  // 2. Criar Usuários RBAC
  const passHash = await bcrypt.hash('123456', 10);
  await prisma.user.createMany({
    data: [
      {
        nome: 'Administrador Geral',
        email: 'admin@petcostelinha.com.br',
        cpf: '111.111.111-11',
        senha_hash: passHash,
        role: Role.ADMIN,
      },
      {
        nome: 'Gerente da Loja',
        email: 'gerente@petcostelinha.com.br',
        cpf: '222.222.222-22',
        senha_hash: passHash,
        role: Role.GERENTE,
      },
      {
        nome: 'Atendente de Balcão',
        email: 'atendente@petcostelinha.com.br',
        cpf: '333.333.333-33',
        senha_hash: passHash,
        role: Role.ATENDENTE,
      },
    ],
  });

  // 3. Criar Categorias Comerciais da Loja
  const catCaes = await prisma.category.create({
    data: { nome: 'Cães', slug: 'caes', icone: 'Bone' },
  });
  const catGatos = await prisma.category.create({
    data: { nome: 'Gatos', slug: 'gatos', icone: 'Feather' },
  });
  const catAves = await prisma.category.create({
    data: { nome: 'Aves & Gaiolas', slug: 'aves', icone: 'Grid' },
  });
  const catHigiene = await prisma.category.create({
    data: { nome: 'Higiene & Cuidados', slug: 'higiene', icone: 'ShieldAlert' },
  });
  const catAcessorios = await prisma.category.create({
    data: { nome: 'Acessórios, Potes & Roupas', slug: 'acessorios', icone: 'ShoppingBag' },
  });

  // 4. Cadastrar Todos os Produtos com Médias de Preço Reais do Mercado BR
  const produtosData = [
    // --- RAÇÕES & PETISCOS CÃES ---
    {
      nome: 'Ração Special Dog Premium Cães Adultos Carne 15kg',
      descricao: 'Nutrição completa e balanceada para cães adultos de médio e grande porte. Sem corantes artificiais.',
      preco_custo: 95.00,
      preco_venda: 139.90,
      estoque: 25,
      imagem_url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80',
      destaque: true,
      categoria_id: catCaes.id,
    },
    {
      nome: 'Ração Magnus Chips Cães Adultos Carne e Frango 15kg',
      descricao: 'Sabor irresistível com nuggets crocantes. Proteína de alta digestibilidade.',
      preco_custo: 85.00,
      preco_venda: 129.90,
      estoque: 30,
      imagem_url: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600&auto=format&fit=crop&q=80',
      destaque: true,
      categoria_id: catCaes.id,
    },
    {
      nome: 'Ração Magnus Todo Dia Cães Pequeno Porte Carne e Frango 15kg',
      descricao: 'Grãos adaptados para mandíbulas pequenas com extrato de yucca que reduz o odor das fezes.',
      preco_custo: 80.00,
      preco_venda: 119.90,
      estoque: 20,
      imagem_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop&q=80',
      destaque: false,
      categoria_id: catCaes.id,
    },
    {
      nome: 'Petisco Magnus Biscoito Original para Cães 400g',
      descricao: 'Biscoitos crocantes nutritivos com formato divertido. Auxilia no combate ao tártaro.',
      preco_custo: 9.50,
      preco_venda: 14.90,
      estoque: 50,
      imagem_url: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=600&auto=format&fit=crop&q=80',
      destaque: true,
      categoria_id: catCaes.id,
    },
    {
      nome: 'Petisco Magnus Mix Biscoito Frango e Vegetais 400g',
      descricao: 'Petisco assado com vegetais selecionados e proteína de frango.',
      preco_custo: 9.50,
      preco_venda: 14.90,
      estoque: 40,
      imagem_url: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=600&auto=format&fit=crop&q=80',
      destaque: false,
      categoria_id: catCaes.id,
    },
    {
      nome: 'Molho para Ração Sabor Carne Dog Chow 250ml',
      descricao: 'Molho saboroso para deixar a ração seca ainda mais apetitosa.',
      preco_custo: 6.00,
      preco_venda: 9.90,
      estoque: 35,
      imagem_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop&q=80',
      destaque: false,
      categoria_id: catCaes.id,
    },
    {
      nome: 'Tapete Higiênico Slim para Cães 30 Unidades (60x60cm)',
      descricao: 'Alta capacidade de absorção com gel secante e atrativo canino.',
      preco_custo: 38.00,
      preco_venda: 59.90,
      estoque: 18,
      imagem_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80',
      destaque: true,
      categoria_id: catCaes.id,
    },

    // --- GATOS: AREIA, CAIXA, SACHÊS E BRINQUEDOS ---
    {
      nome: 'Areia Higiênica Sanitária Pipicat / Kets para Gatos 4kg',
      descricao: 'Clumps firmes de rápida absorção e neutralização eficiente de odores.',
      preco_custo: 10.50,
      preco_venda: 16.90,
      estoque: 60,
      imagem_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
      destaque: true,
      categoria_id: catGatos.id,
    },
    {
      nome: 'Caixa de Areia / Bandeja Higiênica para Gatos Plast Pet',
      descricao: 'Bandeja alta anti-respingo que facilita a limpeza diária.',
      preco_custo: 18.00,
      preco_venda: 29.90,
      estoque: 15,
      imagem_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop&q=80',
      destaque: false,
      categoria_id: catGatos.id,
    },
    {
      nome: 'Sachê Whiskas Gatos Adultos Sabor Carne / Frango 85g',
      descricao: 'Alimento úmido completo e balanceado rico em vitaminas. Oferta especial.',
      preco_custo: 2.20,
      preco_venda: 3.50,
      estoque: 120,
      imagem_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&auto=format&fit=crop&q=80',
      destaque: true,
      categoria_id: catGatos.id,
    },
    {
      nome: 'Sachê Optimum Gatos Castrados Sabor Carne 85g',
      descricao: 'Controle de calorias e proteção do trato urinário dos felinos.',
      preco_custo: 2.50,
      preco_venda: 3.90,
      estoque: 80,
      imagem_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
      destaque: false,
      categoria_id: catGatos.id,
    },
    {
      nome: 'Petisco Magnus Cat Biscoito para Gatos 85g',
      descricao: 'Snacks crocantes recheados com sabor peixe e leite.',
      preco_custo: 5.00,
      preco_venda: 8.90,
      estoque: 45,
      imagem_url: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=600&auto=format&fit=crop&q=80',
      destaque: false,
      categoria_id: catGatos.id,
    },
    {
      nome: 'Brinquedo Varinha com Pena e Chocalho para Gatos',
      descricao: 'Estimula o instinto caçador e o exercício físico dos felinos.',
      preco_custo: 8.00,
      preco_venda: 14.90,
      estoque: 25,
      imagem_url: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&auto=format&fit=crop&q=80',
      destaque: false,
      categoria_id: catGatos.id,
    },

    // --- CONE / COLAR ELIZABETANO & SAÚDE ---
    {
      nome: 'Colar Elizabetano Protetor Cone Plástico Cães e Gatos Nº 4',
      descricao: 'Cone de proteção pós-operatório e pós-banho em plástico flexível com bordas aveludadas.',
      preco_custo: 14.00,
      preco_venda: 24.90,
      estoque: 22,
      imagem_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80',
      destaque: true,
      categoria_id: catHigiene.id,
    },
    {
      nome: 'Shampoo & Condicionador Neutro Sanol Pet 500ml',
      descricao: 'Fórmula suave hipoalergênica com queratina e extratos vegetais.',
      preco_custo: 13.00,
      preco_venda: 22.90,
      estoque: 30,
      imagem_url: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=600&auto=format&fit=crop&q=80',
      destaque: true,
      categoria_id: catHigiene.id,
    },

    // --- AVES, GAIOLAS E SUPORTES ---
    {
      nome: 'Mistura Nutripássaros Calopsita e Agapornis 1kg',
      descricao: 'Sementes selecionadas, girassol, painço e extrusados vitaminados.',
      preco_custo: 11.00,
      preco_venda: 18.90,
      estoque: 40,
      imagem_url: 'https://images.unsplash.com/photo-1522858533980-370d76a5b69c?w=600&auto=format&fit=crop&q=80',
      destaque: true,
      categoria_id: catAves.id,
    },
    {
      nome: 'Gaiola de Madeira Luxo para Canários e Curió',
      descricao: 'Gaiola artesanal reforçada com varetas de bambu e acabamento em verniz marfim.',
      preco_custo: 55.00,
      preco_venda: 89.90,
      estoque: 12,
      imagem_url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&auto=format&fit=crop&q=80',
      destaque: true,
      categoria_id: catAves.id,
    },
    {
      nome: 'Suporte de Parede e Chão para Gaiolas de Pássaros',
      descricao: 'Suporte metálico reforçado em pintura epóxi anti-ferrugem.',
      preco_custo: 24.00,
      preco_venda: 39.90,
      estoque: 15,
      imagem_url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&auto=format&fit=crop&q=80',
      destaque: false,
      categoria_id: catAves.id,
    },
    {
      nome: 'Suporte com Rodízio para Viveiro Grande de Pássaros',
      descricao: 'Base com rodinhas giratórias 360º para fácil movimentação de viveiros.',
      preco_custo: 48.00,
      preco_venda: 79.90,
      estoque: 8,
      imagem_url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&auto=format&fit=crop&q=80',
      destaque: false,
      categoria_id: catAves.id,
    },

    // --- ACESSÓRIOS: POTES, COLEIRAS E ROUPAS ---
    {
      nome: 'Comedouro e Bebedouro Duplo para Ração e Água 500ml',
      descricao: 'Potes duplos em aço inox com base em silicone antiderrapante.',
      preco_custo: 16.00,
      preco_venda: 27.90,
      estoque: 25,
      imagem_url: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=600&auto=format&fit=crop&q=80',
      destaque: true,
      categoria_id: catAcessorios.id,
    },
    {
      nome: 'Coleira e Guia Ajustável de Nylon para Cães',
      descricao: 'Fita dupla de nylon resistente com trava de segurança reforçada.',
      preco_custo: 20.00,
      preco_venda: 34.90,
      estoque: 30,
      imagem_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80',
      destaque: false,
      categoria_id: catAcessorios.id,
    },
    {
      nome: 'Coleira Anti-Enforcamento com Guizo para Gatos',
      descricao: 'Fecho breakaway de segurança que abre sob pressão em caso de enrosco.',
      preco_custo: 10.00,
      preco_venda: 18.90,
      estoque: 35,
      imagem_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
      destaque: false,
      categoria_id: catAcessorios.id,
    },
    {
      nome: 'Roupa de Frio Soft Fleece para Cães e Gatos Tam M',
      descricao: 'Roupinha quente e aconchegante em tecido soft antialérgico para os dias frios.',
      preco_custo: 22.00,
      preco_venda: 39.90,
      estoque: 20,
      imagem_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80',
      destaque: true,
      categoria_id: catAcessorios.id,
    },
  ];

  for (const prod of produtosData) {
    await prisma.product.create({ data: prod });
  }

  console.log('🎉 Seeding comercial completo do Pet Costelinha concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
