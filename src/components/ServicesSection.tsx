'use client';

import React from 'react';
import { Store, Truck, Stethoscope, ShieldCheck, CreditCard, HeartHandshake } from 'lucide-react';

export const ServicesSection: React.FC = () => {
  return (
    <section id="servicos" className="my-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      
      {/* Título de Seção Estilo Figma */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Diferenciais Pet Costelinha
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Por que Comprar Conosco?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Atendimento presencial dedicado, entrega rápida no seu bairro e facilidade de pagamento via PIX Mercado Pago.
        </p>
      </div>

      {/* Grade de 4 Benefícios em Estilo Cards Figma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 space-y-3.5 group hover:-translate-y-1">
          <div className="w-12 h-12 bg-emerald-950 text-amber-400 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Store className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Loja Física Completa</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Variedade em rações Magnus, Special Dog, areias higiênicas, tapetes e acessórios para cães, gatos e aves.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 space-y-3.5 group hover:-translate-y-1">
          <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Truck className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Tele-Entrega Expressa</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Receba sacos de ração de 15kg, areia higiênica e medicamentos na sua porta com total segurança.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 space-y-3.5 group hover:-translate-y-1">
          <div className="w-12 h-12 bg-emerald-950 text-amber-400 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <CreditCard className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">PIX Mercado Pago</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Geração de QR Code dinâmico com confirmação instantânea e emissão de Nota Fiscal Eletrônica.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 space-y-3.5 group hover:-translate-y-1">
          <div className="w-12 h-12 bg-amber-500 text-emerald-950 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Orientação de Balcão</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Atendimento atencioso para escolha da ração ideal (filhotes, idosos ou castrados) e indicação de antipulgas.
          </p>
        </div>

      </div>
    </section>
  );
};
