# 🐶 Pet Costelinha - E-Commerce & Painel Administrativo Multi-Usuário (RBAC)

![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38BDF8?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma_ORM-5.22-2D3748?style=for-the-badge&logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)
![Mercado Pago](https://img.shields.io/badge/Mercado_Pago-PIX_Real-009EE3?style=for-the-badge)

Aplicação Web Full-Stack para a loja comercial **Pet Costelinha**, combinando um E-commerce responsivo, interativo e com design corporativo limpo com um Painel Administrativo SaaS Multi-Usuário com Controle de Acesso Baseado em Cargos (RBAC).

---

## 🌟 Funcionalidades Principais

### 🛍️ E-Commerce & Loja Virtual
- **Catálogo de Produtos Reais**: Rações Magnus, Special Dog, areias higiênicas, tapetes, gaiolas de madeira, petiscos e medicamentos veterinários com **médias reais de preço do mercado brasileiro**.
- **Visualização Otimizada**: Exibição inicial de 8 produtos para navegação rápida com expansão sob demanda (*"Veja Mais Produtos"*).
- **Modal de Detalhes Completo**: Janela modal ao clicar no produto com imagens em alta definição, especificações técnicas, seletor de quantidade e garantia de origem.
- **Filtros por Categoria**: Navegação fluida por Cães, Gatos, Aves & Gaiolas, Higiene & Cuidados e Acessórios.
- **Carrinho Slid-Over**: Drawer lateral responsivo com atualização em tempo real do subtotal.
- **Checkout com Validação de CPF**: Algoritmo real de validação de CPF (formato `000.000.000-00`) e máscara telefônica `(00) 00000-0000`.
- **Pagamento PIX Real (Mercado Pago)**: Geração de QR Code e código PIX EMV Copia e Cola via API v1 do Mercado Pago com confirmação instantânea via **Webhook**.

---

### 🛡️ Painel Administrativo SaaS (RBAC) & Configurações
- **Autenticação Segura JWT**: Criptografia de senhas com `bcryptjs` e gestão de sessões via Cookies HttpOnly.
- **Níveis de Acesso RBAC**:
  - `ADMIN`: Acesso total, incluindo edição de usuários, relatórios financeiros e dados da loja.
  - `GERENTE`: Gestão de estoque, catálogo de produtos e atualização de status de pedidos.
  - `ATENDENTE`: Visualização e controle de separação dos pedidos de balcão.
  - `CLIENTE`: Perfil de comprador da loja virtual.
- **Módulos do Painel**:
  - **Dashboard Financeiro**: Métricas de faturamento, margem de lucro calculada `(preço venda - custo) * quantidade`, total de pedidos e ticket médio.
  - **Gestão de Pedidos**: Filtros por CPF, nome do comprador, código do pedido e atualização de status (`PENDING`, `PAID`, `PROCESSING`, `DELIVERED`, `CANCELLED`).
  - **Gestão de Estoque**: Cadastro, edição, alerta de estoque baixo (<= 5 un.) e cálculo automático de margem.
  - **Gestão de Equipe**: Cadastro, exclusão e alteração de nome, e-mail, cargo e redefinição de senha de qualquer usuário.
  - **Configurações da Loja (`/admin/settings`)**: Edição em tempo real do Nome Comercial, Slogan, Telefone, WhatsApp, E-mail de Suporte, Endereço Físico, CNPJ e Chave PIX Oficial.

---

## 🛠️ Tecnologias Utilizadas

- **Framework Frontend/Backend**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [TailwindCSS](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **ORM & Banco de Dados**: [Prisma ORM](https://www.prisma.io/) com [MySQL](https://www.mysql.com/)
- **Autenticação**: JWT (`jsonwebtoken`) & bcryptjs
- **Envio de E-mails Transacionais**: [Nodemailer](https://nodemailer.com/)
- **Integração de Pagamento**: Mercado Pago Payment API v1 (PIX & Webhooks)

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
- Node.js v18+ instalado
- Servidor MySQL rodando na máquina local (ex: XAMPP, WAMP ou MySQL Server nativo na porta `3306`)

### 2. Clonar o Repositório
```bash
git clone https://github.com/davizinho/pet-costelinha.git
cd pet-costelinha
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
```env
DATABASE_URL="mysql://root:root@localhost:3306/petshop_db"
JWT_SECRET="pet_costelinha_jwt_secret_key_2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Credenciais Mercado Pago (Opcional para ambiente de teste)
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-seu-token-aqui"

# Configuração SMTP E-mail (Opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
```

### 5. Executar Migrações e Seeding do Banco de Dados
```bash
npx prisma db push
npm run db:seed
```

### 6. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação no navegador:
- **Loja Virtual**: `http://localhost:3000`
- **Painel Administrativo**: `http://localhost:3000/admin/login`

---

## 🔑 Credenciais para Testes de Acesso (RBAC)

No painel de login (`/admin/login`), você pode clicar nos botões de acesso rápido ou utilizar as credenciais:

| Cargo | E-mail | Senha |
| :--- | :--- | :--- |
| **ADMIN** | `admin@petcostelinha.com.br` | `123456` |
| **GERENTE** | `gerente@petcostelinha.com.br` | `123456` |
| **ATENDENTE** | `atendente@petcostelinha.com.br` | `123456` |

---

## 📂 Estrutura de Pastas do Projeto

```
pet-costelinha/
├── prisma/
│   ├── schema.prisma       # Modelos Prisma (Product, Category, Order, User, StoreSetting)
│   └── seed.ts             # Dados de inicialização comerciais e produtos reais
├── src/
│   ├── app/
│   │   ├── admin/          # Páginas do Painel Administrativo (Dashboard, Pedidos, Produtos, Usuários, Configurações)
│   │   ├── api/            # Rotas API REST (Auth, Produtos, Pedidos, Usuários, Settings, Webhooks)
│   │   ├── globals.css     # Estilos globais e utilitários 3D / TailwindCSS
│   │   ├── layout.tsx      # Root Layout com suporte a fonts
│   │   └── page.tsx        # Storefront HomePage da Loja Virtual
│   ├── components/
│   │   ├── ui/             # Componentes de UI (Toast, Skeleton)
│   │   ├── AdminLayout.tsx # Layout SaaS Sidebar para o Admin
│   │   ├── CartDrawer.tsx  # Carrinho Deslizante Lateral
│   │   ├── CheckoutModal.tsx # Modal de Checkout com PIX e Validação de CPF
│   │   ├── Header.tsx      # Cabeçalho Comercial da Loja
│   │   ├── Hero3DFlip.tsx  # Seção Hero com Card Flip 3D
│   │   ├── ManifestoScroll.tsx # Seção Manifesto de Cuidado Pet
│   │   ├── JourneyScroll.tsx   # Seção Etapas da Jornada de Compra
│   │   ├── ProductCard.tsx     # Card de Produto com Botão de Compra
│   │   ├── ProductDetailsModal.tsx # Modal de Detalhes Completos do Produto
│   │   └── ServicesSection.tsx # Seção de Informações Comerciais da Loja
│   └── lib/
│       ├── auth.ts         # Utilitários de verificação JWT
│       ├── masks.ts        # Máscaras de CPF, Telefone e Formatador de Moeda (BRL)
│       └── prisma.ts       # Instância global do Prisma Client
├── package.json
└── README.md
```

---

## 📝 Licença

Este projeto foi desenvolvido para fins comerciais e educacionais. Todos os direitos reservados à **Pet Costelinha**.
