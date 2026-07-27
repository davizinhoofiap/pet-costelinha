'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Cookie, Check, X } from 'lucide-react';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('pet_costelinha_lgpd_consent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch (e) {}
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(
        'pet_costelinha_lgpd_consent',
        JSON.stringify({
          accepted: true,
          date: new Date().toISOString(),
          type: 'ALL',
        })
      );
    } catch (e) {}
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    try {
      localStorage.setItem(
        'pet_costelinha_lgpd_consent',
        JSON.stringify({
          accepted: true,
          date: new Date().toISOString(),
          type: 'NECESSARY',
        })
      );
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 font-sans pointer-events-auto">
      <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-md text-white border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 bg-orange-600/20 text-orange-400 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 border border-orange-500/30">
            <Cookie className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                Sua Privacidade é Prioridade (LGPD)
              </h4>
              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                Lei nº 13.709/2018
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Utilizamos cookies essenciais e tecnologias semelhantes para garantir o funcionamento seguro do e-commerce, processar pagamentos e personalizar sua experiência.{' '}
              <Link
                href="/politica-de-privacidade"
                className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2"
              >
                Conheça nossa Política de Privacidade
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <button
            onClick={handleAcceptNecessary}
            className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            Apenas Necessários
          </button>
          <button
            onClick={handleAcceptAll}
            className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Check className="w-4 h-4 stroke-[2]" /> Aceitar Todos
          </button>
        </div>
      </div>
    </div>
  );
}
