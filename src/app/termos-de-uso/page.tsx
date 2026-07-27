'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, ShoppingCart, RefreshCw, ShieldAlert, Truck, HelpCircle } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
      <div>
        {/* Header Bar */}
        <header className="bg-slate-900 border-b border-slate-800 py-4 px-4 sm:px-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 stroke-[1.5]" /> Voltar à Loja
            </Link>

            <span className="text-xs font-mono text-orange-400 bg-orange-950/60 border border-orange-800/80 px-3 py-1 rounded-full uppercase tracking-wider font-bold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-orange-400 stroke-[2]" /> Conforme o CDC (Lei nº 8.078/90)
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Termos e Condições Gerais de Uso e Venda
            </h1>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Regras e diretrizes para navegação, compras e entregas no e-commerce da <strong>Pet Costelinha</strong>.
            </p>
            <p className="text-[11px] font-mono text-slate-500">Última atualização: 26 de Julho de 2026</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-300 text-xs leading-relaxed shadow-xl">
            {/* Seção 1 */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 stroke-[2]" /> 1. Aceitação dos Termos e Cadastro
              </h2>
              <p>
                Ao navegar ou efetuar compras no site <strong>Pet Costelinha</strong>, você concorda integralmente com estes Termos de Uso. O cadastro e o checkout exigem dados verídicos e a aceitação explícita dos Termos e da Política de Privacidade.
              </p>
            </section>

            {/* Seção 2 */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <RefreshCw className="w-4 h-4 stroke-[2]" /> 2. Preços, Pagamento e Estoque
              </h2>
              <p>
                Os preços e disponibilidades dos produtos podem variar de acordo com o estoque em nossa loja física e online.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>Pagamento via PIX:</strong> O processamento é realizado via Mercado Pago com aprovação instantânea. O QR Code possui validade temporária. Pedidos não pagos expirará o link de reserva do estoque.</li>
                <li><strong>Garantia de Preço:</strong> O valor praticado será sempre o exibido na confirmação do checkout no momento da compra.</li>
              </ul>
            </section>

            {/* Seção 3 */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <RefreshCw className="w-4 h-4 stroke-[2]" /> 3. Direito de Arrependimento e Devoluções (Art. 49 do CDC)
              </h2>
              <p>
                Em conformidade com o <strong>Artigo 49 do Código de Defesa do Consumidor</strong>, nas compras realizadas fora do estabelecimento comercial (pela internet), o cliente possui até <strong>7 (sete) dias corridos</strong> a contar do recebimento do produto para desistir da compra.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>Condições do Produto:</strong> Para devolução de rações, medicamentos ou produtos de higiene, a embalagem original deve estar <strong>lacrada, sem violação e sem indícios de uso</strong>.</li>
                <li><strong>Reembolso Integral:</strong> O valor total pago (incluindo o frete) será estornado via PIX ou crédito no meio de pagamento utilizado em até 3 (três) dias úteis após o recebimento e vistoria do item devolvido.</li>
              </ul>
            </section>

            {/* Seção 4 */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 stroke-[2]" /> 4. Prazos e Condições de Entrega
              </h2>
              <p>
                As entregas são efetuadas no endereço informado pelo comprador no checkout. É fundamental garantir a presença de um responsável no local para o recebimento do pedido.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>Frete Grátis Express:</strong> Válido para compras com valor total acima do mínimo estipulado na loja física/online para a região.</li>
                <li><strong>Avarias no Transporte:</strong> Caso a embalagem externa esteja danificada ou violada no momento do recebimento, o cliente deve recusar a entrega e notificar imediatamente o suporte.</li>
              </ul>
            </section>

            {/* Seção 5 */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 stroke-[2]" /> 5. Uso Responsável de Medicamentos Veterinários
              </h2>
              <p>
                Os medicamentos antipulgas, vermífugos e demais itens farmacêuticos disponibilizados possuem finalidade informativa e comercial. Recomendamos sempre a consulta ao Médico Veterinário antes da administração de qualquer substância ao seu animal de estimação.
              </p>
            </section>

            {/* Seção 6 */}
            <section className="space-y-2 pt-4 border-t border-slate-800">
              <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 stroke-[2]" /> 6. Canal de Atendimento e Foro
              </h2>
              <p>
                Dúvidas ou solicitações referentes aos Termos de Uso devem ser direcionadas ao suporte pelo e-mail{' '}
                <a href="mailto:contato@petcostelinha.com.br" className="text-orange-400 font-bold underline">
                  contato@petcostelinha.com.br
                </a>{' '}
                ou pelo WhatsApp comercial <strong className="text-white">(11) 5197-1916</strong>. Fica eleito o Foro do domicílio do Consumidor para dirimir eventuais controvérsias.
              </p>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
