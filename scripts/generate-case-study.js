const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateCaseStudy() {
  console.log('🚀 Iniciando geração do PDF e Imagens de Apresentação...');

  const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Pet Costelinha - Case Study & Documentação</title>
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

  <!-- SLIDE 1: CAPA COMERCIAL / CASE STUDY -->
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
          <p class="text-xs font-mono text-orange-400 font-semibold tracking-wider uppercase">PORTFÓLIO DE PROJETO COMERCIAL FULL-STACK</p>
        </div>
      </div>
      <div class="px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-mono">
        🌐 Online na Vercel
      </div>
    </div>

    <!-- Hero Content -->
    <div class="space-y-6 z-10 my-auto">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-semibold">
        <i data-lucide="award" class="w-4 h-4 text-amber-400"></i>
        <span>Documentação Técnica & Apresentação Comercial de Cliente</span>
      </div>

      <h2 class="text-5xl font-black font-display tracking-tight text-white leading-tight">
        E-Commerce & Painel SaaS Multi-Usuário<br/>
        <span class="gradient-text">Comunicação Direta, PIX Real & Controle RBAC</span>
      </h2>

      <p class="text-slate-300 text-base max-w-3xl leading-relaxed">
        Solução Web completa para a loja física e online <strong class="text-amber-400">Pet Costelinha</strong>. Unifica a loja virtual responsiva para clientes com um painel administrativo corporativo para gestão de estoque, vendas com margem de lucro em tempo real e níveis de acesso por perfil.
      </p>

      <!-- Tech Stack Badges -->
      <div class="pt-4 flex flex-wrap gap-3">
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2">
          <i data-lucide="layers" class="w-4 h-4 text-orange-400"></i> Next.js 14 (App Router)
        </span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2">
          <i data-lucide="code-2" class="w-4 h-4 text-blue-400"></i> TypeScript 5
        </span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2">
          <i data-lucide="database" class="w-4 h-4 text-emerald-400"></i> Prisma ORM + MySQL
        </span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2">
          <i data-lucide="qr-code" class="w-4 h-4 text-cyan-400"></i> Mercado Pago PIX v1
        </span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2">
          <i data-lucide="shield-check" class="w-4 h-4 text-purple-400"></i> Autenticação JWT + RBAC
        </span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2">
          <i data-lucide="globe" class="w-4 h-4 text-emerald-400"></i> Deploy Vercel Production
        </span>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between z-10 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
      <div>Desenvolvido para: <span class="text-white font-semibold">Pet Costelinha (São Paulo - SP)</span></div>
      <div>Link Vercel: <span class="text-orange-400 font-mono">https://pet-costelinha.vercel.app</span></div>
    </div>
  </div>

  <!-- SLIDE 2: OBJETIVO DO DESENVOLVIMENTO & MOTIVAÇÃO -->
  <div id="slide-2" class="slide-page p-12 flex flex-col justify-between relative bg-slate-950">
    <div class="border-b border-slate-800 pb-4">
      <span class="text-xs font-mono text-orange-400 uppercase font-semibold">01 / CONTEXTO E PROPOSIÇÃO DE VALOR</span>
      <h2 class="text-3xl font-bold font-display text-white mt-1">Por Que o Projeto Foi Desenvolvido?</h2>
    </div>

    <div class="grid grid-cols-2 gap-6 my-auto">
      <!-- Card Desafio -->
      <div class="glass-card p-6 rounded-2xl space-y-4">
        <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <i data-lucide="alert-triangle" class="w-5 h-5"></i>
        </div>
        <h3 class="text-lg font-bold text-white font-display">O Desafio do Cliente</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          A pet shop física atuava com atendimentos informais via WhatsApp e anotações manuais em papel. Isso gerava imprecisão na margem de lucro, falhas na separação de pedidos, controle de estoque desatualizado e ausência de uma experiência digital profissional.
        </p>
        <ul class="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800">
          <li class="flex items-center gap-2"><i data-lucide="x-circle" class="w-4 h-4 text-red-400"></i> Sem catálogo com preços reais atualizados</li>
          <li class="flex items-center gap-2"><i data-lucide="x-circle" class="w-4 h-4 text-red-400"></i> Riscos de fraude e dados cadastrais incompletos</li>
          <li class="flex items-center gap-2"><i data-lucide="x-circle" class="w-4 h-4 text-red-400"></i> Dificuldade na gestão de funções da equipe</li>
        </ul>
      </div>

      <!-- Card Solução -->
      <div class="glass-card p-6 rounded-2xl space-y-4 border-amber-500/30">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <i data-lucide="check-circle-2" class="w-5 h-5"></i>
        </div>
        <h3 class="text-lg font-bold text-white font-display">A Solução Desenvolvida</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          Criou-se uma plataforma web integrada de alta performance: uma storefront rápida e elegante para o cliente final e um painel de administração corporativo com regras de acesso personalizadas para os colaboradores.
        </p>
        <ul class="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Pagamento instantâneo via PIX (Mercado Pago)</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Validador algorítmico real de CPF no checkout</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Relatório de margem de lucro por item em tempo real</li>
        </ul>
      </div>
    </div>

    <!-- Metrics Row -->
    <div class="grid grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-center">
      <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div class="text-xl font-bold text-orange-400 font-mono">100%</div>
        <div class="text-[10px] text-slate-400 uppercase font-medium">Produtos Reais Cadastrados</div>
      </div>
      <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div class="text-xl font-bold text-emerald-400 font-mono">&lt; 3s</div>
        <div class="text-[10px] text-slate-400 uppercase font-medium">Geração de QR Code PIX</div>
      </div>
      <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div class="text-xl font-bold text-blue-400 font-mono">4 Níveis</div>
        <div class="text-[10px] text-slate-400 uppercase font-medium">RBAC (Admin, Gerente...)</div>
      </div>
      <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div class="text-xl font-bold text-purple-400 font-mono">60 FPS</div>
        <div class="text-[10px] text-slate-400 uppercase font-medium">Navegação & Micro-animações</div>
      </div>
    </div>
  </div>

  <!-- SLIDE 3: STOREFRONT & CHECKOUT INTELIGENTE -->
  <div id="slide-3" class="slide-page p-12 flex flex-col justify-between relative bg-slate-950">
    <div class="border-b border-slate-800 pb-4">
      <span class="text-xs font-mono text-orange-400 uppercase font-semibold">02 / EXPERIÊNCIA DO CLIENTE</span>
      <h2 class="text-3xl font-bold font-display text-white mt-1">Storefront & Checkout com PIX Automático</h2>
    </div>

    <div class="grid grid-cols-3 gap-5 my-auto">
      <!-- Feature 1 -->
      <div class="glass-card p-5 rounded-2xl space-y-3">
        <div class="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
          <i data-lucide="shopping-cart" class="w-5 h-5"></i>
        </div>
        <h3 class="text-sm font-bold text-white font-display">Catálogo & Carrinho Slide-Over</h3>
        <p class="text-xs text-slate-300">
          Navegação otimizada por categorias (Cães, Gatos, Pássaros, Medicamentos), busca instantânea e drawer lateral com atualização em tempo real do subtotal.
        </p>
      </div>

      <!-- Feature 2 -->
      <div class="glass-card p-5 rounded-2xl space-y-3 border-amber-500/30">
        <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
          <i data-lucide="shield-check" class="w-5 h-5"></i>
        </div>
        <h3 class="text-sm font-bold text-white font-display">Validação Algorítmica de CPF</h3>
        <p class="text-xs text-slate-300">
          O formulário de checkout valida digitos verificadores do CPF em tempo real (evitando cadastros falsos) com máscara automática para telefone e CEP.
        </p>
      </div>

      <!-- Feature 3 -->
      <div class="glass-card p-5 rounded-2xl space-y-3">
        <div class="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
          <i data-lucide="qr-code" class="w-5 h-5"></i>
        </div>
        <h3 class="text-sm font-bold text-white font-display">PIX Dinâmico Mercado Pago</h3>
        <p class="text-xs text-slate-300">
          Integração via API v1 com geração instantânea do código PIX Copia e Cola e QR Code base64, além de escuta via Webhook para alteração de status.
        </p>
      </div>
    </div>

    <!-- Diagrama / Flow Stream -->
    <div class="glass-card p-6 rounded-2xl border-slate-800">
      <div class="text-xs font-mono text-slate-400 mb-3 uppercase tracking-wider font-semibold">Fluxo Completo de Compra do Cliente:</div>
      <div class="flex items-center justify-between text-xs text-slate-200">
        <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <i data-lucide="search" class="w-4 h-4 text-orange-400"></i> 1. Seleção de Produto
        </div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600"></i>
        <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <i data-lucide="shopping-bag" class="w-4 h-4 text-orange-400"></i> 2. Adição ao Carrinho
        </div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600"></i>
        <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <i data-lucide="user-check" class="w-4 h-4 text-amber-400"></i> 3. Checkout com CPF
        </div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600"></i>
        <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <i data-lucide="qr-code" class="w-4 h-4 text-cyan-400"></i> 4. Pagamento PIX
        </div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600"></i>
        <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <i data-lucide="truck" class="w-4 h-4 text-emerald-400"></i> 5. Despacho & Entrega
        </div>
      </div>
    </div>
  </div>

  <!-- SLIDE 4: PAINEL ADMINISTRATIVO SAAS & MATRIZ RBAC -->
  <div id="slide-4" class="slide-page p-12 flex flex-col justify-between relative bg-slate-950">
    <div class="border-b border-slate-800 pb-4">
      <span class="text-xs font-mono text-orange-400 uppercase font-semibold">03 / GESTÃO CORPORATIVA</span>
      <h2 class="text-3xl font-bold font-display text-white mt-1">Painel Administrativo SaaS & Níveis RBAC</h2>
    </div>

    <!-- Tabela RBAC -->
    <div class="my-auto space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-sm font-bold text-white font-display">Matriz de Permissões de Acesso (Role-Based Access Control)</h3>
        <span class="text-xs font-mono text-slate-400">Segurança via JWT Cookie HttpOnly</span>
      </div>

      <table class="w-full text-left text-xs border-collapse rounded-xl overflow-hidden glass-card">
        <thead>
          <tr class="bg-slate-900 text-orange-400 font-mono border-b border-slate-800">
            <th class="p-3">Módulo / Recurso</th>
            <th class="p-3">ADMIN</th>
            <th class="p-3">GERENTE</th>
            <th class="p-3">ATENDENTE</th>
            <th class="p-3">CLIENTE</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60 text-slate-300">
          <tr>
            <td class="p-3 font-semibold text-white">Dashboard Financeiro & Lucro Bruto</td>
            <td class="p-3 text-emerald-400 font-bold">✅ Total</td>
            <td class="p-3 text-red-400">❌ Sem Acesso</td>
            <td class="p-3 text-red-400">❌ Sem Acesso</td>
            <td class="p-3 text-red-400">❌ Sem Acesso</td>
          </tr>
          <tr>
            <td class="p-3 font-semibold text-white">Gestão de Equipe (Criar/Excluir Usuários)</td>
            <td class="p-3 text-emerald-400 font-bold">✅ Total</td>
            <td class="p-3 text-red-400">❌ Sem Acesso</td>
            <td class="p-3 text-red-400">❌ Sem Acesso</td>
            <td class="p-3 text-red-400">❌ Sem Acesso</td>
          </tr>
          <tr>
            <td class="p-3 font-semibold text-white">Cadastro & Edição de Produtos / Estoque</td>
            <td class="p-3 text-emerald-400 font-bold">✅ Total</td>
            <td class="p-3 text-emerald-400 font-bold">✅ Total</td>
            <td class="p-3 text-slate-400">👁️ Consulta</td>
            <td class="p-3 text-red-400">❌ Sem Acesso</td>
          </tr>
          <tr>
            <td class="p-3 font-semibold text-white">Atualização de Status de Pedidos</td>
            <td class="p-3 text-emerald-400 font-bold">✅ Total</td>
            <td class="p-3 text-emerald-400 font-bold">✅ Total</td>
            <td class="p-3 text-emerald-400 font-bold">✅ Separação</td>
            <td class="p-3 text-slate-400">👁️ Acompanhar</td>
          </tr>
          <tr>
            <td class="p-3 font-semibold text-white">Configurações da Loja (CNPJ, Chave PIX)</td>
            <td class="p-3 text-emerald-400 font-bold">✅ Total</td>
            <td class="p-3 text-red-400">❌ Sem Acesso</td>
            <td class="p-3 text-red-400">❌ Sem Acesso</td>
            <td class="p-3 text-red-400">❌ Sem Acesso</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Note -->
    <div class="glass-card p-4 rounded-xl flex items-center justify-between text-xs text-slate-300">
      <div class="flex items-center gap-2">
        <i data-lucide="key" class="w-4 h-4 text-amber-400"></i>
        <span>Senha encriptada com <strong class="text-white">bcryptjs</strong> e renovação de tokens com proteção contra CSRF.</span>
      </div>
      <div class="text-orange-400 font-mono">Rota: /admin/login</div>
    </div>
  </div>

  <!-- SLIDE 5: ACESSO EM PRODUÇÃO & DEPLOY VERCEL -->
  <div id="slide-5" class="slide-page p-12 flex flex-col justify-between relative bg-slate-950">
    <div class="border-b border-slate-800 pb-4">
      <span class="text-xs font-mono text-orange-400 uppercase font-semibold">04 / APLICAÇÃO ONLINE EM PRODUÇÃO</span>
      <h2 class="text-3xl font-bold font-display text-white mt-1">Acesso Direto ao Site (Vercel)</h2>
    </div>

    <div class="grid grid-cols-2 gap-6 my-auto">
      <!-- Links de Producao -->
      <div class="glass-card p-6 rounded-2xl space-y-4 border-amber-500/30">
        <div class="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <i data-lucide="globe" class="w-6 h-6"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-white font-display">Links Oficiais em Produção</h3>
            <p class="text-xs text-slate-400 font-mono">Hospedado na plataforma Vercel</p>
          </div>
        </div>

        <div class="space-y-3 text-xs font-mono">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span class="text-slate-400 block text-[10px] uppercase font-sans font-semibold mb-1">🌐 Loja Virtual (Storefront):</span>
            <span class="text-amber-400 font-bold">https://pet-costelinha.vercel.app</span>
          </div>

          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span class="text-slate-400 block text-[10px] uppercase font-sans font-semibold mb-1">🔐 Painel Administrativo Login:</span>
            <span class="text-orange-400 font-bold">https://pet-costelinha.vercel.app/admin/login</span>
          </div>

          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span class="text-slate-400 block text-[10px] uppercase font-sans font-semibold mb-1">🎨 Showcase Design System:</span>
            <span class="text-cyan-400 font-bold">https://pet-costelinha.vercel.app/preview.html</span>
          </div>
        </div>
      </div>

      <!-- Test Accounts -->
      <div class="glass-card p-6 rounded-2xl space-y-3 text-xs">
        <div class="text-orange-400 font-bold font-sans text-sm border-b border-slate-800 pb-2 flex items-center justify-between">
          <span>Credenciais para Testes de Avaliadores:</span>
          <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
        </div>
        <p class="text-slate-300">Acesse o painel online e selecione os cargos para testar a experiência RBAC:</p>

        <div class="space-y-2 text-slate-300">
          <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
            <div>
              <span class="font-bold text-white block">ADMINISTRADOR</span>
              <span class="text-slate-400 text-[11px]">admin@petcostelinha.com.br</span>
            </div>
            <span class="font-mono text-amber-400 bg-slate-800 px-2 py-1 rounded">123456</span>
          </div>

          <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
            <div>
              <span class="font-bold text-white block">GERENTE DE ESTOQUE</span>
              <span class="text-slate-400 text-[11px]">gerente@petcostelinha.com.br</span>
            </div>
            <span class="font-mono text-amber-400 bg-slate-800 px-2 py-1 rounded">123456</span>
          </div>

          <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
            <div>
              <span class="font-bold text-white block">ATENDENTE DE BALCÃO</span>
              <span class="text-slate-400 text-[11px]">atendente@petcostelinha.com.br</span>
            </div>
            <span class="font-mono text-amber-400 bg-slate-800 px-2 py-1 rounded">123456</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Final Badge -->
    <div class="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
      <div>© 2026 Pet Costelinha. Desenvolvido para exibição no GitHub e LinkedIn.</div>
      <div class="text-emerald-400 font-mono font-semibold flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Production Online na Vercel 🚀
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
      console.log(`📸 Imagem gerada: docs/screenshots/${fileName}`);
    }
  }

  // Remove old screenshot file if it exists
  const oldScreenshot = path.join(screenshotsDir, '5_arquitetura_e_instalacao.png');
  if (fs.existsSync(oldScreenshot)) {
    fs.unlinkSync(oldScreenshot);
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

  console.log(`📄 PDF gerado com sucesso: Pet_Costelinha_Documentacao_Case_Study.pdf`);

  await browser.close();
}

generateCaseStudy().catch(err => {
  console.error('❌ Erro na geração do Case Study:', err);
  process.exit(1);
});
