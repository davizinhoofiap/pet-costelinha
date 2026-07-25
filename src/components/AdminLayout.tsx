'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, Settings, Store, Shield } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/admin/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/admin/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Sidebar SaaS Minimalista */}
      <aside className="w-full md:w-60 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold">
                <Store className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block leading-tight">
                  Pet Costelinha
                </span>
                <span className="text-[10px] text-slate-500">Gestão Comercial</span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-3 m-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[11px]">
              {user.nome.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 truncate">{user.nome}</p>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Cargo: {user.role}
              </span>
            </div>
          </div>

          {/* Links */}
          <nav className="p-2 space-y-1">
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/admin/dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 stroke-[1.5]" />
              <span>Visão Geral & KPIs</span>
            </Link>

            <Link
              href="/admin/orders"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/admin/orders'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
              <span>Gestão de Pedidos</span>
            </Link>

            {(user.role === 'ADMIN' || user.role === 'GERENTE') && (
              <Link
                href="/admin/products"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  pathname === '/admin/products'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Package className="w-4 h-4 stroke-[1.5]" />
                <span>Estoque & Produtos</span>
              </Link>
            )}

            {user.role === 'ADMIN' && (
              <>
                <Link
                  href="/admin/users"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    pathname === '/admin/users'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 stroke-[1.5]" />
                  <span>Equipe & Permissões</span>
                </Link>

                <Link
                  href="/admin/settings"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    pathname === '/admin/settings'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Settings className="w-4 h-4 stroke-[1.5]" />
                  <span>Configurações Loja</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <Link
            href="/"
            className="w-full text-left text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50"
          >
            ← Ir para Loja Virtual
          </Link>

          <button
            onClick={handleLogout}
            className="w-full text-left text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-rose-50"
          >
            <LogOut className="w-4 h-4 stroke-[1.5]" /> Sair da Conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
        {children}
      </main>
    </div>
  );
};
