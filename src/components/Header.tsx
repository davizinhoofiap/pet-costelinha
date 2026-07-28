'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Phone, Store, User, LogOut, ShieldCheck, HeartPulse } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenAuthModal: () => void;
  currentUser: any;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  searchTerm,
  onSearchChange,
  onOpenAuthModal,
  currentUser,
  onLogout,
}) => {
  const [storeName, setStoreName] = useState('Pet Costelinha');
  const [storePhone, setStorePhone] = useState('(11) 5197-1916');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.nome_loja) {
          setStoreName(data.nome_loja);
          if (data.telefone) setStorePhone(data.telefone);
        }
      })
      .catch(() => {});
  }, []);

  const isAdminOrStaff = currentUser && ['ADMIN', 'GERENTE', 'ATENDENTE'].includes(currentUser.role);

  return (
    <header className="sticky top-0 z-40 bg-emerald-950/95 backdrop-blur-md text-white border-b border-emerald-900/80 shadow-lg font-sans">
      {/* 1. TOP BAR ANNOUNCEMENT (FIGMA TEMPLATE) */}
      <div className="bg-emerald-900/90 text-emerald-100 text-[11px] py-1.5 px-4 font-mono border-b border-emerald-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-emerald-950 font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
              Frete Grátis
            </span>
            <span className="hidden sm:inline text-emerald-200 font-sans text-xs">
              Entrega rápida de rações, medicamentos e acessórios em seu bairro!
            </span>
          </div>

          <div className="flex items-center gap-4 text-emerald-200 font-semibold text-xs">
            <span className="hidden md:flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-amber-400" /> Atendimento Especializado
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-400 stroke-[2]" />
              {storePhone}
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION NAVBAR (FIGMA TEMPLATE) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-6">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 bg-amber-500 text-emerald-950 rounded-2xl flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white block uppercase leading-none">
              {storeName}
            </span>
            <span className="text-[10px] font-extrabold text-amber-400 tracking-widest uppercase block mt-0.5">
              Petshop & Farmácia
            </span>
          </div>
        </Link>

        {/* Links de Navegação estilo Figma */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-emerald-100 uppercase tracking-wider">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            Início
          </Link>
          <a href="#catalogo" className="hover:text-amber-400 transition-colors">
            Catálogo
          </a>
          <a href="#servicos" className="hover:text-amber-400 transition-colors">
            Serviços
          </a>
          <a href="#contato" className="hover:text-amber-400 transition-colors">
            Contato
          </a>
        </nav>

        {/* Search Bar */}
        <div className="flex-1 max-w-sm hidden md:block relative">
          <input
            type="text"
            placeholder="Buscar medicamentos, rações premium..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-emerald-900/60 border border-emerald-800/90 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-emerald-300/70 focus:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors shadow-inner"
          />
          <Search className="w-4 h-4 text-emerald-300 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2]" />
        </div>

        {/* User Actions & Cart */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href="/perfil"
                className="flex items-center gap-2 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-800 px-3 py-1.5 rounded-xl text-xs transition-colors"
                title="Acessar Meu Perfil e Pets"
              >
                <User className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
                <span className="font-bold text-white max-w-[100px] truncate">{currentUser.nome}</span>
                {isAdminOrStaff && (
                  <span className="bg-amber-400 text-emerald-950 font-mono text-[9px] font-black px-1.5 py-0.5 rounded">
                    {currentUser.role}
                  </span>
                )}
              </Link>

              {isAdminOrStaff && (
                <Link
                  href="/admin/dashboard"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-black text-white bg-emerald-900 hover:bg-emerald-800 px-3 py-2 rounded-xl border border-emerald-800 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400 stroke-[2]" /> Admin
                </Link>
              )}

              <button
                onClick={onLogout}
                title="Sair da Conta"
                className="bg-emerald-900/80 hover:bg-rose-900/50 text-emerald-200 hover:text-rose-300 p-2 rounded-xl border border-emerald-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 text-xs font-black text-emerald-100 hover:text-white bg-emerald-900/80 hover:bg-emerald-800 px-3.5 py-2 rounded-2xl border border-emerald-800/80 transition-all cursor-pointer shadow-xs"
            >
              <User className="w-4 h-4 text-amber-400 stroke-[2.5]" />
              <span>Entrar / Cadastrar</span>
            </button>
          )}

          {/* Cart Button estilo Figma */}
          <button
            onClick={onOpenCart}
            className="relative bg-orange-600 hover:bg-orange-500 text-white font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md hover:shadow-orange-600/30 active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Carrinho</span>
            {cartCount > 0 && (
              <span className="bg-amber-400 text-emerald-950 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
