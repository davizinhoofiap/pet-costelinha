'use client';

import React, { useEffect, useState } from 'react';
import { Store, Phone, MapPin, Mail, ShieldCheck, Lock, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState({
    nome_loja: 'Pet Costelinha',
    slogan: 'Alimentos premium, linha farmacêutica e cuidados com seu amigo',
    telefone: '(11) 5197-1916',
    email_suporte: 'contato@petcostelinha.com.br',
    endereco: 'Rua Benigno Nogueira Franco, 367 - Jd. das Oliveras, SP',
    cnpj: '12.345.678/0001-90',
  });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.nome_loja) setStoreInfo(data);
      })
      .catch(() => {});
  }, []);

  return (
    <footer id="contato" className="bg-emerald-950 text-white pt-14 pb-8 border-t border-emerald-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* COLUNA 1: LOGO & INSTITUCIONAL (FIGMA TEMPLATE) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 text-emerald-950 rounded-2xl flex items-center justify-center font-black shadow-md">
              <Store className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white uppercase block leading-none">
                {storeInfo.nome_loja}
              </span>
              <span className="text-[10px] font-extrabold text-amber-400 tracking-widest uppercase block mt-0.5">
                Petshop Comercial
              </span>
            </div>
          </div>

          <p className="text-xs text-emerald-200/80 leading-relaxed">
            {storeInfo.slogan}
          </p>

          <div className="pt-2 text-[11px] text-emerald-300/70 font-mono">
            CNPJ: {storeInfo.cnpj}
          </div>
        </div>

        {/* COLUNA 2: ATENDIMENTO & CONTATO */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-amber-400">
            Atendimento & Loja Física
          </h4>
          <ul className="space-y-2 text-xs text-emerald-100">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 stroke-[2] mt-0.5" />
              <span className="leading-relaxed">{storeInfo.endereco}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2]" />
              <span className="font-bold">{storeInfo.telefone}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-emerald-300 shrink-0 stroke-[2]" />
              <span>{storeInfo.email_suporte}</span>
            </li>
          </ul>
        </div>

        {/* COLUNA 3: PRIVACIDADE & CONFORMIDADE LGPD */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-amber-400">
            Privacidade & Legal (LGPD)
          </h4>
          <ul className="space-y-2 text-xs text-emerald-100">
            <li>
              <Link href="/politica-de-privacidade" className="hover:text-amber-400 flex items-center gap-2 transition-colors">
                <Lock className="w-3.5 h-3.5 text-emerald-400 stroke-[2]" /> Política de Privacidade (LGPD)
              </Link>
            </li>
            <li>
              <Link href="/termos-de-uso" className="hover:text-amber-400 flex items-center gap-2 transition-colors">
                <FileText className="w-3.5 h-3.5 text-emerald-300 stroke-[2]" /> Termos e Condições de Uso
              </Link>
            </li>
            <li className="text-[11px] text-emerald-300/70 pt-1 font-mono">
              Encarregado DPO: dpo@petcostelinha.com.br
            </li>
          </ul>
        </div>

        {/* COLUNA 4: PORTAL DE GESTÃO ADMIN (FIGMA) */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-amber-400">
            Portal de Gestão
          </h4>
          <p className="text-xs text-emerald-200/80 leading-relaxed">
            Acesso administrativo corporativo para controle de estoque, expedição de pedidos e relatórios.
          </p>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white font-black text-xs px-4 py-2.5 rounded-xl border border-emerald-800 transition-colors uppercase tracking-wider"
          >
            Acessar Admin <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>

      </div>

      {/* RODAPÉ DE COPYRIGHT & BANDEIRA SEGURA (ESTILO FIGMA) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-emerald-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/70 gap-3">
        <p>© 2026 {storeInfo.nome_loja}. Todos os direitos reservados. Conforme CDC e LGPD.</p>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 stroke-[2]" />
          <span className="font-semibold text-emerald-200">Conexão Criptografada TLS 1.3 / SSL Mercado Pago</span>
        </div>
      </div>
    </footer>
  );
};
