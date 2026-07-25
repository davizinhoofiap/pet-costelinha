'use client';

import React from 'react';
import { ShoppingBag, CreditCard, QrCode, Truck, ArrowRight, Sparkles } from 'lucide-react';

export const JourneyScroll: React.FC = () => {
  const steps = [
    {
      number: '01',
      tag: '[ 01. CATÁLOGO COMPLETO ]',
      title: 'Seleção dos Produtos',
      desc: 'Navegue por rações Magnus, Special Dog, areias higiênicas, gaiolas, tapetes e acessórios oficiais.',
      icon: ShoppingBag,
    },
    {
      number: '02',
      tag: '[ 02. CHECKOUT INTELIGENTE ]',
      title: 'Dados & CPF do Cliente',
      desc: 'Preencha seus dados com validação algorítmica de CPF em tempo real para emissão da nota fiscal (NF-e).',
      icon: CreditCard,
    },
    {
      number: '03',
      tag: '[ 03. PAGAMENTO PIX REAL ]',
      title: 'Confirmação Mercado Pago',
      desc: 'Leia o QR Code ou copie o código PIX EMV oficial. Liberação automática via Webhook em segundos.',
      icon: QrCode,
    },
    {
      number: '04',
      tag: '[ 04. TELE-ENTREGA EXPRESSA ]',
      title: 'Receba em sua Casa',
      desc: 'Equipe de balcão separa os itens e despacha para entrega imediata no seu bairro.',
      icon: Truck,
    },
  ];

  return (
    <div className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden font-sans">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Header da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-slate-800 text-orange-400 text-xs font-mono tracking-widest uppercase px-3.5 py-1 rounded-full border border-slate-700 mb-2">
              <Sparkles className="w-3.5 h-3.5 stroke-[1.5]" />
              [ EXPERIÊNCIA SIMPLES E SEGURA ]
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Como funciona sua compra no Pet Costelinha
            </h2>
          </div>

          <p className="text-xs text-slate-400 max-w-sm font-normal leading-relaxed">
            Processo 100% digital integrado com a loja física para entrega rápida no seu endereço.
          </p>
        </div>

        {/* Grade de 4 Passos Estática */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="bg-slate-800/90 border border-slate-700/80 hover:border-orange-500/80 p-6 rounded-2xl space-y-4 transition-all duration-200 hover:shadow-xl flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono tracking-wider text-orange-400 uppercase font-semibold">
                      {step.tag}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-slate-700 text-orange-400 group-hover:bg-orange-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4 stroke-[1.5]" />
                    </div>
                  </div>

                  <div className="text-3xl font-black text-slate-500 group-hover:text-orange-400 transition-colors">
                    {step.number}
                  </div>

                  <h3 className="text-base font-extrabold text-white group-hover:text-orange-300 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Passo {step.number}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-400 group-hover:translate-x-1 transition-transform stroke-[1.5]" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
