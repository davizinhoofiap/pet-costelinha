'use client';

import React from 'react';
import { Truck, ShieldCheck, Award, ArrowRight, PhoneCall, CheckCircle } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-slate-900 text-white rounded-2xl my-6 mx-4 sm:mx-6 lg:mx-8 border border-slate-800 shadow-sm">
      <div className="relative max-w-7xl mx-auto px-6 py-10 sm:py-12 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Content */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 bg-slate-800 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full border border-slate-700">
            <CheckCircle className="w-3.5 h-3.5 stroke-[1.5]" />
            Distribuidora Autorizada de Rações & Medicamentos
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
            Nutrição de Alta Performance e Linha Veterinária Especializada
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Oferecemos as principais marcas do mercado nacional com procedência garantida, orientação farmacêutica e entrega expressa para a sua região.
          </p>

          {/* Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0 stroke-[1.5]" />
              <span className="text-xs text-slate-200 font-medium">Entrega Local Expressa</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 stroke-[1.5]" />
              <span className="text-xs text-slate-200 font-medium">Garantia de Origem</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <Award className="w-4 h-4 text-amber-400 shrink-0 stroke-[1.5]" />
              <span className="text-xs text-slate-200 font-medium">Marcas Super Premium</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="#catalogo"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              Explorar Catálogo de Produtos
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </a>

            <a
              href="https://wa.me/551151971916"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400 stroke-[1.5]" />
              Atendimento WhatsApp
            </a>
          </div>
        </div>

        {/* Right Hero Image Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-slate-700 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80"
              alt="Pet Costelinha"
              className="w-full aspect-4/3 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-xs text-slate-300">
              <p className="font-semibold text-white">Pet Costelinha Estabelecimento Comercial</p>
              <p className="text-[11px] text-slate-400">Atendimento presencial e tele-entrega com nota fiscal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
