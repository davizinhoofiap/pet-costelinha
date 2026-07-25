'use client';

import React from 'react';
import { Star, ShieldCheck, Heart, Award, Sparkles, CheckCircle2 } from 'lucide-react';

export const ManifestoScroll: React.FC = () => {
  return (
    <div className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden font-sans">
      {/* Glow de Fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-10 relative z-10 text-center">
        
        {/* Badge Mono */}
        <div className="inline-flex items-center gap-2 bg-slate-800 text-orange-400 text-xs font-mono tracking-widest uppercase px-4 py-1.5 rounded-full border border-slate-700">
          <Sparkles className="w-3.5 h-3.5 stroke-[1.5]" />
          [ AMOR & CUIDADO VETERINÁRIO ]
        </div>

        {/* Headline Principal Limpa */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight uppercase">
            Onde o bem-estar do seu pet <br />
            <span className="text-orange-500 underline decoration-orange-400 decoration-wavy decoration-2">
              e a melhor nutrição
            </span>{' '}
            se encontram
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Trabalhamos exclusivamente com marcas oficiais autorizadas para garantir a longevidade, vitalidade e alegria da sua família de quatro patas.
          </p>
        </div>

        {/* Grade de Garantias e Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
          
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Award className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Produtos 100% Originais</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Distribuição direta de marcas como Royal Canin, Premier, Special Dog, Magnus, Drontal e Bravecto.
            </p>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="font-extrabold text-sm text-white">10.000+ Pets Atendidos</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Anos de tradição e compromisso com o atendimento da comunidade pet local e online.
            </p>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Heart className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Atendimento Humanizado</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Orientação técnica sobre rações de acordo com porte, idade e necessidades nutricionais específicas.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
