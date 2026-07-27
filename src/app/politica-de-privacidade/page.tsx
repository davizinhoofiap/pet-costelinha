'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, FileText, UserCheck, Key, Eye } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function PoliticaDePrivacidadePage() {
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

            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full uppercase tracking-wider font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[2]" /> LGPD Compliant (Lei 13.709/2018)
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Política de Privacidade e Proteção de Dados
            </h1>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Sua privacidade é fundamental para nós. Conheça detalhadamente como coletamos, armazenamos, tratamos e protegemos seus dados pessoais no e-commerce <strong>Pet Costelinha</strong>.
            </p>
            <p className="text-[11px] font-mono text-slate-500">Última atualização: 26 de Julho de 2026</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-300 text-xs leading-relaxed shadow-xl">
            {/* Seção 1 */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 stroke-[2]" /> 1. Quem Somos e Nosso Compromisso
              </h2>
              <p>
                A <strong>Pet Costelinha</strong> (CNPJ 12.345.678/0001-90), com sede na Rua Benigno Nogueira Franco, 367 - Jd. das Oliveiras, São Paulo/SP, atua como <strong>Controladora</strong> de dados pessoais nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
              </p>
            </section>

            {/* Seção 2 */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 stroke-[2]" /> 2. Dados Pessoais Coletados e Finalidades
              </h2>
              <p>Coletamos estritamente os dados necessários para a execução do contrato de compra e venda:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>Nome Completo e CPF:</strong> Emissão de Nota Fiscal (obrigação legal) e identificação do comprador.</li>
                <li><strong>E-mail e Telefone/WhatsApp:</strong> Envio de comprovantes de pagamento PIX, rastreio e atendimento de pós-venda.</li>
                <li><strong>Endereço Completo:</strong> Entrega dos produtos através da nossa frota própria ou transportadoras parceiras.</li>
                <li><strong>Dados dos Pets (Opcional):</strong> Espécie, raça e nome para oferta de nutrição e medicamentos personalizados.</li>
              </ul>
            </section>

            {/* Seção 3 */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 stroke-[2]" /> 3. Segurança e Criptografia da Informação
              </h2>
              <p>
                Adotamos medidas técnicas robustas de segurança da informação para garantir a integridade dos seus dados:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>Criptografia em Trânsito (TLS 1.3/SSL):</strong> Todas as comunicações entre seu navegador e nossos servidores são protegidas por HTTPS criptografado.</li>
                <li><strong>Criptografia em Repouso (AES-256-GCM):</strong> Dados sensíveis gravados no banco de dados na nuvem (Aiven Cloud) utilizam criptografia forte.</li>
                <li><strong>Pagamentos Seguros:</strong> Transações PIX são processadas diretamente via Gateway Oficial do Mercado Pago. <strong>Nenhum dado bancário ou de cartão é armazenado nos nossos servidores.</strong></li>
                <li><strong>Proteção Anti-Bot e Rate Limiting:</strong> Formulários protegidos por Cloudflare Turnstile e limitação de requisições via Upstash Redis.</li>
              </ul>
            </section>

            {/* Seção 4 */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 stroke-[2]" /> 4. Compartilhamento de Dados com Terceiros
              </h2>
              <p>
                Os seus dados pessoais **nunca são vendidos ou comercializados**. O compartilhamento ocorre exclusivamente com operadores parceiros essenciais para a operação:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>Mercado Pago:</strong> Para geração do QR Code PIX e liquidação financeira do pedido.</li>
                <li><strong>Transportadoras e Entregadores:</strong> Apenas os dados de entrega (Nome, Telefone e Endereço) para cumprimento da entrega.</li>
                <li><strong>Autoridades Fiscais (SEFAZ):</strong> Para cumprimento de obrigações tributárias legais.</li>
              </ul>
            </section>

            {/* Seção 5 */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 stroke-[2]" /> 5. Direitos do Titular de Dados (Art. 18 da LGPD)
              </h2>
              <p>Você possui total controle sobre seus dados pessoais. A qualquer momento, você pode solicitar:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Confirmação da existência de tratamento e acesso aos dados.</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados através da sua área de perfil.</li>
                <li>Exclusão/Anonimização dos dados pessoais (respeitando prazos legais de guarda fiscal de 5 anos).</li>
                <li>Revogação do consentimento concedido.</li>
              </ul>
            </section>

            {/* Seção 6 */}
            <section className="space-y-2 pt-4 border-t border-slate-800">
              <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider">
                6. Contato do Encarregado de Proteção de Dados (DPO)
              </h2>
              <p>
                Para exercer seus direitos de titular ou esclarecer dúvidas sobre esta Política, entre em contato com o nosso Encarregado pelo e-mail:{' '}
                <a href="mailto:dpo@petcostelinha.com.br" className="text-orange-400 font-bold underline">
                  dpo@petcostelinha.com.br
                </a>{' '}
                ou pelo WhatsApp oficial <strong className="text-white">(11) 5197-1916</strong>.
              </p>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
