'use client';

import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, Sparkles, PhoneCall, ArrowRight, Heart } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white py-12 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative font-sans">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* LADO ESQUERDO: TAGLINE + TITULO + SUBTITULO + BOTÕES CTA (ESTILO FIGMA) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          <div className="inline-flex items-center gap-2 bg-emerald-900/80 border border-amber-400/40 px-3.5 py-1.5 rounded-full shadow-md">
            <Sparkles className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              O Melhor para a Saúde do seu Pet
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
            Nutrição Premium & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400">
              Farmácia Veterinária
            </span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 font-medium max-w-xl leading-relaxed">
            As melhores marcas de rações (Magnus, Special Dog), antipulgas, medicamentos, areias higiênicas e acessórios com tele-entrega expressa no seu bairro.
          </p>

          {/* Botões de Ação Duplos */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <a
              href="#catalogo"
              className="bg-orange-600 hover:bg-orange-500 text-white font-black px-7 py-3.5 rounded-2xl text-xs sm:text-sm uppercase tracking-wider shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              Explorar Catálogo
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </a>

            <a
              href="https://wa.me/551151971916"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-800/80 hover:bg-emerald-700 text-white font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm uppercase tracking-wider border border-emerald-700 shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-emerald-300 stroke-[2]" />
              Falar no WhatsApp
            </a>
          </div>

          {/* Selos de Confiança no Fazer Pedido */}
          <div className="pt-6 border-t border-emerald-800/60 grid grid-cols-3 gap-4 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-amber-400/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">Entrega Rápida</span>
                <span className="text-[10px] text-emerald-300 block">No seu bairro</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-400/20 text-emerald-300 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">PIX Mercado Pago</span>
                <span className="text-[10px] text-emerald-300 block">Aprovação imediata</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-rose-400/20 text-rose-300 rounded-xl flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">Loja Autorizada</span>
                <span className="text-[10px] text-emerald-300 block">Produtos 100% Originais</span>
              </div>
            </div>
          </div>

        </div>

        {/* LADO DIREITO: SHOWCASE CARD COM BADGES FLUTUANTES (ESTILO FIGMA) */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-md bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-3xl p-6 backdrop-blur-md shadow-2xl space-y-5 text-center">
            
            <div className="w-20 h-20 bg-amber-500 text-emerald-950 rounded-3xl mx-auto flex items-center justify-center shadow-lg font-black text-3xl">
              🐾
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest">
                Pet Costelinha Premium
              </span>
              <h3 className="text-xl font-black text-white">Tudo para Cães, Gatos e Aves</h3>
              <p className="text-xs text-emerald-200 leading-relaxed">
                Rações especiais, sachês, antipulgas de marcas consagradas e acessórios de higiene.
              </p>
            </div>

            {/* Badge de Promoção em Tempo Real */}
            <div className="bg-emerald-950/80 border border-amber-400/30 p-3.5 rounded-2xl flex items-center justify-between text-xs">
              <div className="text-left">
                <span className="text-[9px] font-bold text-amber-400 block uppercase">Desconto Especial PIX</span>
                <span className="font-extrabold text-white">Pagamento 100% Seguro</span>
              </div>
              <span className="bg-amber-400 text-emerald-950 font-black px-2.5 py-1 rounded-lg text-[10px] uppercase">
                Aprovação 1s
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
