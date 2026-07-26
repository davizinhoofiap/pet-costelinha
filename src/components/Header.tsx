'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Phone, Store, User, LogOut, ShieldCheck } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md font-sans">
      {/* Top Banner Status */}
      <div className="bg-slate-950 text-slate-300 text-[11px] py-1.5 px-4 font-mono border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-orange-600 text-white font-extrabold px-2 py-0.2 rounded-md text-[10px]">
              [ LOJA OFICIAL ]
            </span>
            <span className="hidden sm:inline text-slate-300">
              Rações Magnus, Special Dog, Areias Higiênicas, Gaiolas e Medicamentos
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300 font-semibold">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400 stroke-[1.5]" />
              {storePhone}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-orange-600 text-white rounded-2xl flex items-center justify-center font-extrabold shadow-sm group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white block uppercase leading-none">
              {storeName}
            </span>
            <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
              [ LOJA COMERCIAL PETSHOP ]
            </span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block relative">
          <input
            type="text"
            placeholder="Encontre a ração ou produto ideal pro seu pet..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[1.5]" />
        </div>

        {/* User Actions & Cart */}
        <div className="flex items-center gap-2.5">
          {/* User Auth Section */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
                <User className="w-3.5 h-3.5 text-orange-400 stroke-[2]" />
                <span className="font-semibold text-white max-w-[120px] truncate">{currentUser.nome}</span>
                {isAdminOrStaff && (
                  <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                    {currentUser.role}
                  </span>
                )}
              </div>

              {isAdminOrStaff && (
                <Link
                  href="/admin/dashboard"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400 stroke-[1.5]" /> Admin
                </Link>
              )}

              <button
                onClick={onLogout}
                title="Sair da Conta"
                className="bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 p-2 rounded-xl border border-slate-700 transition-colors"
              >
                <LogOut className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-2xl border border-slate-700 transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-orange-400 stroke-[2]" />
              <span>Entrar / Cadastrar</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative bg-orange-600 hover:bg-orange-700 text-white font-extrabold px-4 py-2 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
            <span className="hidden sm:inline">Meu Carrinho</span>
            {cartCount > 0 && (
              <span className="bg-white text-orange-600 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
