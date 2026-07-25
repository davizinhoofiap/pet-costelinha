'use client';

import React from 'react';
import { Store, Truck, Stethoscope, ShoppingBag, ShieldCheck } from 'lucide-react';

export const ServicesSection: React.FC = () => {
  return (
    <div className="my-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-1">
        <span className="text-[10px] font-mono font-semibold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
          [ LOJA COMERCIAL PET COSTELINHA ]
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
          Atendimento Presencial e Tele-Entrega de Produtos Pet
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Loja completa de rações, antipulgas, areias higiênicas, gaiolas e acessórios no seu bairro.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 bg-slate-900 text-orange-400 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 stroke-[1.5]" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Loja Física Completa</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Variedade em rações Magnus, Special Dog, areias higiênicas, tapetes, roupinhas de frio, potes e acessórios para cães, gatos e aves.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5 stroke-[1.5]" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Tele-Entrega Expressa no Bairro</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Receba sacos de ração de 15kg, areia higiênica e medicamentos na sua porta com nota fiscal eletrônica e pagamento via PIX.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 stroke-[1.5]" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Orientação de Balcão Autorizada</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Atendimento atencioso para escolha da ração ideal (filhotes, idosos ou castrados) e indicação de antipulgas autorizados.
          </p>
        </div>
      </div>
    </div>
  );
};
