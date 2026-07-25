'use client';

import React, { useEffect, useState } from 'react';
import { Store, Phone, MapPin, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState({
    nome_loja: 'Pet Costelinha',
    slogan: 'Alimentos premium, linha farmacêutica e cuidados',
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
    <footer className="bg-slate-900 text-white pt-10 pb-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 text-slate-950 rounded-lg flex items-center justify-center font-bold">
              <Store className="w-4 h-4 stroke-[1.5]" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white uppercase">
              {storeInfo.nome_loja}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {storeInfo.slogan}
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            CNPJ: {storeInfo.cnpj}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Atendimento ao Cliente</h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 stroke-[1.5] mt-0.5" />
              <span>{storeInfo.endereco}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0 stroke-[1.5]" />
              <span>{storeInfo.telefone}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0 stroke-[1.5]" />
              <span>{storeInfo.email_suporte}</span>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Linhas de Produtos</h4>
          <ul className="space-y-1 text-xs text-slate-400">
            <li>• Rações Super Premium Cães e Gatos</li>
            <li>• Vermífugos e Linha Veterinária</li>
            <li>• Antipulgas e Carrapaticidas</li>
            <li>• Rações de Pássaros & Sementes</li>
            <li>• Acessórios & Brinquedos</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Acesso Restrito</h4>
          <p className="text-xs text-slate-400">
            Painel corporativo de controle de estoque, pedidos e métricas financeiras.
          </p>
          <Link
            href="/admin/login"
            className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors"
          >
            Portal de Gestão (RBAC) →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <p>© 2026 {storeInfo.nome_loja}. Todos os direitos reservados.</p>
        <p className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[1.5]" /> Ambiente Seguro SSL
        </p>
      </div>
    </footer>
  );
};
