'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, PhoneCall, ShieldCheck, Sparkles, Award, ShoppingBag, Truck } from 'lucide-react';

export const Hero3DFlip: React.FC = () => {
  const phrases = [
    'uma nutrição completa e saudável',
    'produtos de higiene e cuidados pet',
    'rações e acessórios com pronta entrega',
  ];
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-white text-slate-900 overflow-hidden py-10 lg:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-100 font-sans">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* COLUNA 1: LEFT HEADLINE */}
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-orange-400 text-[11px] font-mono tracking-wider uppercase px-3 py-1 rounded-md">
            <Sparkles className="w-3.5 h-3.5 stroke-[1.5]" />
            [ LOJA COMERCIAL PET COSTELINHA ]
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Tudo o que seu pet precisa para{' '}
            <span className="text-orange-600 underline decoration-orange-300 decoration-wavy decoration-2 block mt-1 transition-all duration-500">
              {phrases[activePhraseIndex]}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
            Rações Magnus, Special Dog, areias higiênicas, tapetes, petiscos, coleiras, gaiolas e roupinhas de frio com procedência garantida e entrega no mesmo dia.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
              Produtos 100% Originais
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Truck className="w-4 h-4 text-orange-600 stroke-[1.5]" />
              Tele-Entrega Expressa
            </span>
          </div>
        </div>

        {/* COLUNA 2: CENTER 3D CARD FLIP CONTAINER */}
        <div className="lg:col-span-4 flex justify-center py-4">
          <div
            className="relative w-full max-w-xs h-[360px] perspective-1300 cursor-pointer group"
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="absolute -top-3 -left-3 z-30 bg-slate-900 text-orange-400 text-[10px] font-mono uppercase px-2.5 py-1 rounded-md shadow-md border border-slate-800">
              [ RAÇÕES & PETISCOS MAGNUS ]
            </div>

            <div className="absolute -bottom-3 -right-3 z-30 bg-orange-600 text-white text-[10px] font-mono uppercase px-2.5 py-1 rounded-md shadow-md">
              [ ENTREGA GRÁTIS NO BAIRRO ]
            </div>

            <div className="relative w-full h-full preserve-3d transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]">
              {/* CARD DA FRENTE: RAÇÕES & PETISCOS */}
              <div
                className={`absolute inset-0 rounded-2xl bg-slate-900 text-white p-5 border-2 border-slate-800 shadow-2xl flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${
                  isFlipped
                    ? 'opacity-40 translate-z-[-40px] rotate-y-[-20deg] rotate-z-[8deg] scale-90'
                    : 'opacity-100 translate-z-[0px] rotate-y-[0deg] scale-100 shadow-orange-500/10'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono tracking-wider text-orange-400 uppercase">
                    [ RAÇÕES SUPER PREMIUM ]
                  </span>
                  <Award className="w-5 h-5 text-amber-400 stroke-[1.5]" />
                </div>

                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-800 my-2 border border-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80"
                    alt="Ração Special Dog Magnus"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs">
                    <span className="font-bold block">Special Dog & Magnus 15kg</span>
                    <span className="text-[10px] text-orange-400">Nutrição Completa para Cães</span>
                  </div>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-800">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>Média Mercado BR</span>
                    <span className="text-orange-400">R$ 139,90</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Passe o mouse para ver Areias, Tapetes & Acessórios ➔
                  </p>
                </div>
              </div>

              {/* CARD DE TRÁS: HIGIENE & ACESSÓRIOS */}
              <div
                className={`absolute inset-0 rounded-2xl bg-white text-slate-900 p-5 border-2 border-orange-500 shadow-2xl flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${
                  isFlipped
                    ? 'opacity-100 translate-z-[0px] rotate-y-[0deg] scale-100'
                    : 'opacity-80 translate-z-[-40px] rotate-y-[-20deg] rotate-z-[10deg] scale-90'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono tracking-wider text-orange-600 uppercase">
                    [ HIGIENE & ACESSÓRIOS ]
                  </span>
                  <ShoppingBag className="w-5 h-5 text-orange-600 stroke-[1.5]" />
                </div>

                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 my-2 border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80"
                    alt="Areia Higiênica e Tapetes"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs">
                    <span className="font-bold block">Areias, Tapetes & Potes</span>
                    <span className="text-[10px] text-amber-300">Produtos para Gatos e Cães</span>
                  </div>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span>Atendimento da Loja</span>
                    <span className="text-orange-600">(11) 5197-1916</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Peça pelo WhatsApp e receba em casa com nota fiscal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA 3: RIGHT SUBHEADLINE & CTAS REORGANIZADOS */}
        <div className="lg:col-span-3">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-5 flex flex-col justify-between h-full">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase block mb-1">
                [ ATENDIMENTO COMERCIAL DA LOJA ]
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                Loja física completa no bairro com entregas expressas de rações, areia de gato, gaiolas e medicamentos.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200/70">
              <a
                href="#catalogo"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-98"
              >
                Ver Catálogo Completo
                <ArrowRight className="w-4 h-4 stroke-[1.5]" />
              </a>

              <a
                href="https://wa.me/551151971916?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20de%20produtos."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400 stroke-[1.5]" />
                WhatsApp da Loja
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
