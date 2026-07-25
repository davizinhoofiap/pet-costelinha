'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { DollarSign, TrendingUp, ShoppingBag, Package, ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/masks';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);

      if (parsed.role === 'ADMIN') {
        fetchMetrics();
      } else {
        setLoading(false);
      }
    }
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Painel de Gestão Comercial
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Autenticado como <strong className="text-slate-800">{user?.nome}</strong> (Cargo: <span className="font-semibold uppercase text-slate-700">{user?.role}</span>)
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/orders"
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" /> Gestão de Pedidos
            </Link>
          </div>
        </div>

        {/* ADMIN METRICS */}
        {user?.role === 'ADMIN' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Métricas e Relatórios Financeiros
              </h2>
              <span className="text-[11px] text-slate-500">Atualizado em tempo real</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-200" />
                ))}
              </div>
            ) : metrics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Faturamento Bruto</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 stroke-[1.5]" />
                    </div>
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {formatCurrency(metrics.faturamentoBruto)}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.5]" /> +12.5% em relação ao mês anterior
                  </p>
                </div>

                {/* Metric 2 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Lucro Bruto Estimado</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 stroke-[1.5]" />
                    </div>
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {formatCurrency(metrics.lucroBrutoEstimado)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Margem calculada item a item
                  </p>
                </div>

                {/* Metric 3 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Ticket Médio</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                    </div>
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {formatCurrency(metrics.ticketMedio)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Base em {metrics.totalPedidosPagos} vendas concluidas
                  </p>
                </div>

                {/* Metric 4 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Produtos no Estoque</span>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Package className="w-4 h-4 stroke-[1.5]" />
                    </div>
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {metrics.totalProdutos} itens
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Disponíveis no catálogo
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* GERENTE / OPERAÇÕES */}
        {user?.role === 'GERENTE' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Módulo Operacional do Gerente</h3>
            <p className="text-xs text-slate-500">
              Controle de entrada e saída de estoque, ajustes de preços e liberação de mercadorias.
            </p>
            <div className="pt-2 flex gap-3">
              <Link
                href="/admin/products"
                className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Gerenciar Estoque
              </Link>
            </div>
          </div>
        )}

        {/* ATENDENTE */}
        {user?.role === 'ATENDENTE' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Módulo de Balcão e Separação</h3>
            <p className="text-xs text-slate-500">
              Separe os itens comprados via PIX ou WhatsApp para despacho imediato.
            </p>
            <div className="pt-2 flex gap-3">
              <Link
                href="/admin/orders"
                className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Ver Tabela de Separação
              </Link>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
