const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateCaseStudy() {
  console.log('Iniciando geraçao do PDF e Imagens de Apresentaçao...');

  const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Pet Costelinha - Case Study & Apresentaçao do Projeto</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Fira+Code:wght@500;700&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    body {
      font-family: 'Inter', sans-serif;
      background-color: #090d16;
      color: #f8fafc;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .font-display {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .font-mono {
      font-family: 'Fira Code', monospace;
    }
    .slide-page {
      width: 1120px;
      height: 790px;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      background: #090d16;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .glass-card {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
    }
    .gradient-text {
      background: linear-gradient(135deg, #fb923c 0%, #fef08a 50%, #f97316 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  </style>
</head>
<body class="p-0 m-0">

  <!-- SLIDE 1: CAPA DO PROJETO -->
  <div id="slide-1" class="slide-page p-12 flex flex-col justify-between relative bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40">
    <div class="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Header -->
    <div class="flex items-center justify-between z-10 border-b border-slate-800/80 pb-6">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
          <i data-lucide="dog" class="w-7 h-7"></i>
        </div>
        <div>
          <h1 class="font-display text-2xl font-black tracking-tight text-white">Pet Costelinha</h1>
          <p class="text-xs font-mono text-orange-400 font-semibold tracking-wider uppercase">PROJETO COMERCIAL DESENVOLVIDO PARA CLIENTE</p>
        </div>
      </div>
      <div class="px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-mono">
        Em Produçao na Vercel
      </div>
    </div>

    <!-- Hero Content -->
    <div class="space-y-6 z-10 my-auto">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-semibold">
        <i data-lucide="sparkles" class="w-4 h-4 text-amber-400"></i>
        <span>Plataforma E-Commerce & Sistema de Gestao</span>
      </div>

      <h2 class="text-5xl font-black font-display tracking-tight text-white leading-tight">
        Pet Costelinha<br/>
        <span class="gradient-text">E-Commerce & Painel Administrativo</span>
      </h2>

      <p class="text-slate-300 text-base max-w-3xl leading-relaxed">
        Soluçao Web completa desenvolvida sob medida para a loja comercial <strong class="text-amber-400">Pet Costelinha</strong>. Oferece uma experiência de compra online rápida e moderna para os clientes e um painel de gestao corporativo para controle de produtos, estoque e pedidos.
      </p>

      <!-- Tech Stack Badges -->
      <div class="pt-4 flex flex-wrap gap-3">
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2">
          <i data-lucide="layers" class="w-4 h-4 text-orange-400"></i> Next.js 14 (App Router)
        </span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2">
          <i data-lucide="code-2" class="w-4 h-4 text-blue-400"></i> TypeScript
        </span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2">
          <i data-lucide="database" class="w-4 h-4 text-emerald-400"></i> Prisma ORM + MySQL
        </span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2">
          <i data-lucide="qr-code" class="w-4 h-4 text-cyan-400"></i> Mercado Pago PIX
        </span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2">
          <i data-lucide="palette" class="w-4 h-4 text-pink-400"></i> UI/UX Pro Max Design
        </span>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between z-10 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
      <div>Cliente: <span class="text-white font-semibold">Pet Costelinha</span></div>
      <div>Site Oficial: <span class="text-orange-400 font-mono">https://petcostelinha.vercel.app</span></div>
    </div>
  </div>

  <!-- SLIDE 2: O PROJETO & OBJETIVO -->
  <div id="slide-2" class="slide-page p-12 flex flex-col justify-between relative bg-slate-950">
    <div class="border-b border-slate-800 pb-4">
      <span class="text-xs font-mono text-orange-400 uppercase font-semibold">01 / VISAO GERAL DO PROJETO</span>
      <h2 class="text-3xl font-bold font-display text-white mt-1">Objetivo do Desenvolvimento</h2>
    </div>

    <div class="grid grid-cols-2 gap-6 my-auto">
      <!-- Card Necessidade -->
      <div class="glass-card p-6 rounded-2xl space-y-4">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <i data-lucide="store" class="w-5 h-5"></i>
        </div>
        <h3 class="text-lg font-bold text-white font-display">Necessidade da Loja</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          A loja física precisava de uma presença digital moderna para apresentar seu catálogo completo de produtos (raçoes, medicamentos veterinários, produtos de higiene e acessórios), permitindo vendas online com recebimento instantâneo e gestao organizada dos pedidos.
        </p>
        <ul class="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> Apresentaçao profissional da marca</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> Automatizaçao do processo de vendas</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-amber-400"></i> Facilidade de compra para os clientes</li>
        </ul>
      </div>

      <!-- Card O Que Foi Entregue -->
      <div class="glass-card p-6 rounded-2xl space-y-4 border-amber-500/30">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <i data-lucide="check-circle-2" class="w-5 h-5"></i>
        </div>
        <h3 class="text-lg font-bold text-white font-display">O Que Foi Desenvolvido</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          Foi criada uma plataforma web sob medida, combinando um e-commerce responsivo de alta velocidade com um sistema de gerenciamento interno para a equipe da loja administrar o negócio de forma simples e eficiente.
        </p>
        <ul class="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Loja virtual rápida e interativa</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Pagamentos via PIX automatizados</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Painel de controle de vendas e estoque</li>
        </ul>
      </div>
    </div>

    <!-- Metrics Row -->
    <div class="grid grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-center">
      <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div class="text-xl font-bold text-orange-400 font-mono">100%</div>
        <div class="text-[10px] text-slate-400 uppercase font-medium">Responsivo & Adaptável</div>
      </div>
      <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div class="text-xl font-bold text-emerald-400 font-mono">PIX</div>
        <div class="text-[10px] text-slate-400 uppercase font-medium">Pagamento Instantâneo</div>
      </div>
      <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div class="text-xl font-bold text-blue-400 font-mono">SaaS</div>
        <div class="text-[10px] text-slate-400 uppercase font-medium">Painel de Gestao</div>
      </div>
      <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div class="text-xl font-bold text-purple-400 font-mono">UI/UX</div>
        <div class="text-[10px] text-slate-400 uppercase font-medium">Design Premium</div>
      </div>
    </div>
  </div>

  <!-- SLIDE 3: A LOJA VIRTUAL DO CLIENTE -->
  <div id="slide-3" class="slide-page p-12 flex flex-col justify-between relative bg-slate-950">
    <div class="border-b border-slate-800 pb-4">
      <span class="text-xs font-mono text-orange-400 uppercase font-semibold">02 / RECURSOS DO SITE</span>
      <h2 class="text-3xl font-bold font-display text-white mt-1">E-Commerce & Experiência de Compra</h2>
    </div>

    <div class="grid grid-cols-3 gap-5 my-auto">
      <!-- Feature 1 -->
      <div class="glass-card p-5 rounded-2xl space-y-3">
        <div class="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
          <i data-lucide="shopping-bag" class="w-5 h-5"></i>
        </div>
        <h3 class="text-sm font-bold text-white font-display">Catálogo & Carrinho</h3>
        <p class="text-xs text-slate-300">
          Visualizaçao limpa de produtos, navegaçao por categorias (Cães, Gatos, Pássaros, Medicamentos), busca rápida e carrinho de compras lateral em tempo real.
        </p>
      </div>

      <!-- Feature 2 -->
      <div class="glass-card p-5 rounded-2xl space-y-3 border-amber-500/30">
        <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
          <i data-lucide="shield-check" class="w-5 h-5"></i>
        </div>
        <h3 class="text-sm font-bold text-white font-display">Checkout Seguro</h3>
        <p class="text-xs text-slate-300">
          Formulário intuitivo de finalizaçao com validaçao de dados de cadastro (CPF, telefone e endereço de entrega).
        </p>
      </div>

      <!-- Feature 3 -->
      <div class="glass-card p-5 rounded-2xl space-y-3">
        <div class="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
          <i data-lucide="qr-code" class="w-5 h-5"></i>
        </div>
        <h3 class="text-sm font-bold text-white font-display">Pagamento PIX Real</h3>
        <p class="text-xs text-slate-300">
          Integraçao com Mercado Pago para geraçao instantânea do código PIX EMV Copia e Cola e QR Code dinâmico para facilitar o pagamento pelo cliente.
        </p>
      </div>
    </div>

    <!-- Flow -->
    <div class="glass-card p-6 rounded-2xl border-slate-800">
      <div class="text-xs font-mono text-slate-400 mb-3 uppercase tracking-wider font-semibold">Jornada de Compra do Cliente:</div>
      <div class="flex items-center justify-between text-xs text-slate-200">
        <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <i data-lucide="search" class="w-4 h-4 text-orange-400"></i> Catálogo de Produtos
        </div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600"></i>
        <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <i data-lucide="shopping-bag" class="w-4 h-4 text-orange-400"></i> Adicionar ao Carrinho
        </div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600"></i>
        <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <i data-lucide="user-check" class="w-4 h-4 text-amber-400"></i> Dados de Entrega
        </div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600"></i>
        <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <i data-lucide="qr-code" class="w-4 h-4 text-cyan-400"></i> Pagamento PIX
        </div>
      </div>
    </div>
  </div>

  <!-- SLIDE 4: PAINEL DE GESTÃO -->
  <div id="slide-4" class="slide-page p-12 flex flex-col justify-between relative bg-slate-950">
    <div class="border-b border-slate-800 pb-4">
      <span class="text-xs font-mono text-orange-400 uppercase font-semibold">03 / PAINEL ADMINISTRATIVO</span>
      <h2 class="text-3xl font-bold font-display text-white mt-1">Gerenciamento Interno da Loja</h2>
    </div>

    <div class="grid grid-cols-2 gap-6 my-auto">
      <div class="glass-card p-6 rounded-2xl space-y-4">
        <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
          <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
        </div>
        <h3 class="text-base font-bold text-white font-display">Dashboard & Relatórios</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          Painel centralizado com métricas de vendas da loja, controle financeiro, cálculo de margem de lucro e resumo de pedidos realizados.
        </p>
      </div>

      <div class="glass-card p-6 rounded-2xl space-y-4">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <i data-lucide="package" class="w-5 h-5"></i>
        </div>
        <h3 class="text-base font-bold text-white font-display">Estoque & Pedidos</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          Módulo para cadastro e atualizaçao de produtos, alertas de estoque baixo e acompanhamento do status de cada pedido do cliente.
        </p>
      </div>
    </div>

    <div class="glass-card p-4 rounded-xl flex items-center justify-between text-xs text-slate-300">
      <div class="flex items-center gap-2">
        <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
        <span>Sistema com controle seguro de acessos e autenticaçao corporativa.</span>
      </div>
      <div class="text-orange-400 font-mono">Pet Costelinha Admin</div>
    </div>
  </div>

  <!-- SLIDE 5: SITE EM PRODUÇÃO -->
  <div id="slide-5" class="slide-page p-12 flex flex-col justify-between relative bg-slate-950">
    <div class="border-b border-slate-800 pb-4">
      <span class="text-xs font-mono text-orange-400 uppercase font-semibold">04 / PUBLICAÇAO & PROJETO ENTREGUE</span>
      <h2 class="text-3xl font-bold font-display text-white mt-1">Site Oficial em Produçao</h2>
    </div>

    <div class="my-auto space-y-6">
      <div class="glass-card p-8 rounded-3xl border-amber-500/30 text-center space-y-4 max-w-2xl mx-auto">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 text-white mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30">
          <i data-lucide="globe" class="w-8 h-8"></i>
        </div>
        <h3 class="text-2xl font-bold text-white font-display">Acesse o Site Online</h3>
        <p class="text-slate-300 text-sm">
          O projeto foi implantado e está rodando em produçao para a loja Pet Costelinha:
        </p>

        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-700 inline-block text-base font-mono text-amber-400 font-bold">
          https://petcostelinha.vercel.app
        </div>
      </div>
    </div>

    <!-- Final Badge -->
    <div class="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
      <div>© 2026 Pet Costelinha. Desenvolvido como projeto comercial.</div>
      <div class="text-emerald-400 font-mono font-semibold flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Projeto Concluído & Entregue
      </div>
    </div>
  </div>

  <script>
    lucide.createIcons();
  </script>
</body>
</html>
  `;

  const tempHtmlPath = path.join(__dirname, '..', 'scratch', 'case_study_template.html');
  const scratchDir = path.dirname(tempHtmlPath);
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 850, deviceScaleFactor: 2 });
  await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });

  // 1. Gerar Imagens PNG para cada slide
  const slides = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5'];
  const slideNames = [
    '1_capa_case_study.png',
    '2_objetivo_e_desafio.png',
    '3_storefront_e_checkout.png',
    '4_painel_admin_rbac.png',
    '5_acesso_online_vercel.png'
  ];

  for (let i = 0; i < slides.length; i++) {
    const slideId = slides[i];
    const fileName = slideNames[i];
    const element = await page.$(`#${slideId}`);
    if (element) {
      const imgPath = path.join(screenshotsDir, fileName);
      await element.screenshot({ path: imgPath });
      console.log(`Imagem gerada: docs/screenshots/${fileName}`);
    }
  }

  // 2. Gerar PDF completo
  const pdfPath = path.join(__dirname, '..', 'Pet_Costelinha_Documentacao_Case_Study.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log(`PDF gerado com sucesso: Pet_Costelinha_Documentacao_Case_Study.pdf`);

  await browser.close();
}

generateCaseStudy().catch(err => {
  console.error('Erro na geraçao do Case Study:', err);
  process.exit(1);
});
