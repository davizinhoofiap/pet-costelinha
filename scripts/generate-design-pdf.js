const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function createDesignPDF() {
  const outputPath = path.join(__dirname, '..', 'Pet_Costelinha_UI_WebDesign.pdf');
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // CORES DE MARCA
  const COLOR_YELLOW = '#F59E0B';
  const COLOR_BLACK = '#18181B';
  const COLOR_BLUE = '#0284C7';
  const COLOR_ORANGE = '#F97316';
  const COLOR_LIGHT_BG = '#F8FAFC';
  const COLOR_CARD_BORDER = '#E2E8F0';

  // --- CAPA DO DOCUMENTO ---
  doc.rect(0, 0, 595.28, 841.89).fill(COLOR_BLACK);
  
  // Detalhe Amarelo
  doc.rect(0, 0, 595.28, 16).fill(COLOR_YELLOW);

  doc.fillColor('#F59E0B').fontSize(32).font('Helvetica-Bold').text('PET COSTELINHA', 50, 240);
  doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('MANUAL DE UI & WEB DESIGN SYSTEM', 50, 280);
  
  doc.fillColor('#94A3B8').fontSize(12).font('Helvetica').text('Projeto E-Commerce Full-Stack & Painel Administrativo RBAC', 50, 315);
  
  doc.rect(50, 345, 495, 2).fill(COLOR_YELLOW);

  doc.fillColor('#E2E8F0').fontSize(11).font('Helvetica').text('• Identidade Visual & Guia de Estilos', 50, 370);
  doc.text('• Arquitetura de Componentes & Layout Storefront', 50, 390);
  doc.text('• Painel Administrativo com Controle de Acesso por Cargos (RBAC)', 50, 410);
  doc.text('• Diagrama de Banco de Dados MySQL & Integração PIX Mercado Pago', 50, 430);

  doc.fillColor('#F59E0B').fontSize(10).font('Helvetica-Bold').text('Contatos Oficiais da Loja:', 50, 720);
  doc.fillColor('#94A3B8').fontSize(10).font('Helvetica').text('WhatsApp: (11) 5197-1916  |  Instagram: @petcostelinha', 50, 735);
  doc.text('Endereço: Rua Benigno Nogueira Franco, 367 - Jd. das Oliveras, SP', 50, 750);

  // --- PÁGINA 2: PALETA DE CORES & TIPOGRAFIA ---
  doc.addPage();
  doc.rect(0, 0, 595.28, 841.89).fill(COLOR_LIGHT_BG);

  doc.fillColor(COLOR_BLACK).fontSize(20).font('Helvetica-Bold').text('1. Guia de Identidade Visual & Cores', 40, 40);
  doc.rect(40, 68, 515, 2).fill(COLOR_YELLOW);

  doc.fillColor('#475569').fontSize(10).font('Helvetica').text(
    'A paleta visual do Pet Costelinha combina a energia acolhedora do amarelo ouro com a solidez e profissionalismo do grafite escuro e azul pet.',
    40, 80
  );

  // Amostras de Cores
  const colorsList = [
    { name: 'Amarelo Ouro (Brand Core)', hex: '#F59E0B', rgb: 'RGB(245, 158, 11)', desc: 'Botões CTA, badges promocionais e elementos de destaque.' },
    { name: 'Preto Grafite (Brand Dark)', hex: '#18181B', rgb: 'RGB(24, 24, 27)', desc: 'Topbars, cabeçalhos, rodapé e textos principais.' },
    { name: 'Azul Confiança (Pet Blue)', hex: '#0284C7', rgb: 'RGB(2, 132, 199)', desc: 'Links secundários, selos de qualidade e ícones.' },
    { name: 'Laranja Quente (Offer Orange)', hex: '#F97316', rgb: 'RGB(249, 115, 22)', desc: 'Badges de oferta e alertas de estoque baixo.' },
  ];

  let yPos = 120;
  colorsList.forEach((c) => {
    doc.rect(40, yPos, 45, 45).fillAndStroke(c.hex, COLOR_BLACK);
    doc.fillColor(COLOR_BLACK).fontSize(12).font('Helvetica-Bold').text(c.name, 95, yPos + 2);
    doc.fillColor('#64748B').fontSize(9).font('Helvetica-Bold').text(`${c.hex} | ${c.rgb}`, 95, yPos + 18);
    doc.fillColor('#334155').fontSize(9).font('Helvetica').text(c.desc, 95, yPos + 30);
    yPos += 58;
  });

  // Tipografia
  doc.fillColor(COLOR_BLACK).fontSize(16).font('Helvetica-Bold').text('2. Tipografia & Hierarquia', 40, 370);
  doc.rect(40, 395, 515, 1.5).fill(COLOR_YELLOW);

  doc.fillColor('#1E293B').fontSize(14).font('Helvetica-Bold').text('Título H1 (Outfit 32px Bold)', 40, 410);
  doc.fillColor('#334155').fontSize(12).font('Helvetica-Bold').text('Título H2 (Outfit 20px Bold) - Subtítulos e Seções', 40, 432);
  doc.fillColor('#475569').fontSize(10).font('Helvetica').text('Texto de Corpo (Inter 14px Regular) - Usado para descrições de produtos, textos do carrinho e checkout.', 40, 452);
  doc.fillColor('#64748B').fontSize(9).font('Helvetica-Bold').text('BADGES & LEGENDA (Inter 10px UPPERCASE BOLD) - Usado em tags e botões secundários.', 40, 470);

  // Badges Visual Reference
  doc.fillColor(COLOR_BLACK).fontSize(16).font('Helvetica-Bold').text('3. Selos & Badges de Apresentação', 40, 510);
  doc.rect(40, 535, 515, 1.5).fill(COLOR_YELLOW);

  const badges = [
    { title: '🐾 Tudo para o seu melhor amigo!', bg: '#FFFBEB', border: '#FCD34D', text: '#92400E' },
    { title: '⚡ Entregas Rápidas Sem Taxas Adicionais', bg: '#F0FDF4', border: '#86EFAC', text: '#166534' },
    { title: '🛡️ Validação Real de CPF no Checkout', bg: '#EFF6FF', border: '#93C5FD', text: '#1E40AF' },
    { title: '💳 QR Code PIX Real via Mercado Pago', bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B' },
  ];

  let badgeY = 550;
  badges.forEach((b) => {
    doc.rect(40, badgeY, 515, 32).fillAndStroke(b.bg, b.border);
    doc.fillColor(b.text).fontSize(10).font('Helvetica-Bold').text(b.title, 55, badgeY + 10);
    badgeY += 40;
  });

  // --- PÁGINA 3: LAYOUT E ARQUITETURA DE TELAS ---
  doc.addPage();
  doc.rect(0, 0, 595.28, 841.89).fill(COLOR_LIGHT_BG);

  doc.fillColor(COLOR_BLACK).fontSize(20).font('Helvetica-Bold').text('4. Arquitetura de Telas & Mapeamento de UI', 40, 40);
  doc.rect(40, 68, 515, 2).fill(COLOR_YELLOW);

  // Mapeamento de Telas
  const screens = [
    {
      title: 'A. Loja Virtual (Storefront Customer View)',
      items: [
        'Header Fixo: Logo Pet Costelinha, busca em tempo real, ícone de carrinho com contador e atalho para WhatsApp.',
        'Hero Banner Promo: Layout duplo com selos de entrega rápida, telefone (11) 5197-1916 e imagem de cão.',
        'Carrossel de Categorias: Rações Cães/Gatos, Pássaros, Medicamentos, Vermífugos, Antipulgas e Sementes.',
        'Card de Produto: Imagem HD, etiqueta de categoria, 5 estrelas, preço de venda e botão "Adicionar ao Carrinho".',
        'Checkout Modal: Formulário obrigatório (Nome, Email, CPF com validação algorítmica e Endereço) + PIX Automático.',
      ],
    },
    {
      title: 'B. Painel Administrativo Multi-Usuário (RBAC)',
      items: [
        'Perfil ADMIN: Acesso a relatórios de Faturamento Bruto, Lucro Bruto Estimado ((Venda - Custo) * Qtd) e equipe.',
        'Perfil GERENTE: Gestão de estoque, adição/edição de produtos e alteração de status de entregas.',
        'Perfil ATENDENTE: Tabela de separação diária e despacho de pedidos.',
      ],
    },
  ];

  let screenY = 85;
  screens.forEach((s) => {
    doc.rect(40, screenY, 515, 22).fill('#18181B');
    doc.fillColor('#F59E0B').fontSize(11).font('Helvetica-Bold').text(s.title, 50, screenY + 6);
    screenY += 28;

    s.items.forEach((item) => {
      doc.fillColor('#334155').fontSize(9).font('Helvetica').text(`• ${item}`, 50, screenY);
      screenY += 16;
    });
    screenY += 10;
  });

  // Tabela RBAC
  doc.fillColor(COLOR_BLACK).fontSize(16).font('Helvetica-Bold').text('5. Matriz de Permissões RBAC (Cargos)', 40, 360);
  doc.rect(40, 385, 515, 1.5).fill(COLOR_YELLOW);

  const rbacHeaders = ['Módulo / Recurso', 'ADMIN', 'GERENTE', 'ATENDENTE', 'CLIENTE'];
  const rbacRows = [
    ['Faturamento & Margem de Lucro', '✅ SIM', '❌ NÃO', '❌ NÃO', '❌ NÃO'],
    ['Gestão de Usuários / Equipe', '✅ SIM', '❌ NÃO', '❌ NÃO', '❌ NÃO'],
    ['Cadastro / Edição de Produtos', '✅ SIM', '✅ SIM', '❌ NÃO', '❌ NÃO'],
    ['Alterar Status do Pedido', '✅ SIM', '✅ SIM', '✅ SIM', '❌ NÃO'],
    ['Comprar via PIX / WhatsApp', '✅ SIM', '✅ SIM', '✅ SIM', '✅ SIM'],
  ];

  let rbacY = 400;
  // Draw table headers
  doc.rect(40, rbacY, 515, 20).fill('#0F172A');
  let posX = 45;
  const colWidths = [185, 80, 80, 85, 85];
  rbacHeaders.forEach((h, idx) => {
    doc.fillColor('#F59E0B').fontSize(9).font('Helvetica-Bold').text(h, posX, rbacY + 5);
    posX += colWidths[idx];
  });
  rbacY += 20;

  rbacRows.forEach((row) => {
    doc.rect(40, rbacY, 515, 20).fillAndStroke('#FFFFFF', COLOR_CARD_BORDER);
    let px = 45;
    row.forEach((cell, idx) => {
      doc.fillColor(idx === 0 ? '#1E293B' : '#334155').fontSize(9).font(idx === 0 ? 'Helvetica-Bold' : 'Helvetica').text(cell, px, rbacY + 5);
      px += colWidths[idx];
    });
    rbacY += 20;
  });

  // Footer Nota
  doc.fillColor('#64748B').fontSize(9).font('Helvetica-Oblique').text(
    'Documento gerado automaticamente para apresentação comercial e especificação técnica do projeto Pet Costelinha.',
    40, 760
  );

  doc.end();

  stream.on('finish', () => {
    console.log('✅ Documento PDF de UI & Web Design gerado com sucesso em:', outputPath);
  });
}

createDesignPDF().catch(console.error);
