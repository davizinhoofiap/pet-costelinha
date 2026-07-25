'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { ShoppingCart, Search, Filter, RefreshCw, CheckCircle2, Clock, PackageCheck, Truck, XCircle } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/masks';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/orders?status=${statusFilter}&busca=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[1.5]" /> Pago (PIX)
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-md text-xs font-medium">
            <PackageCheck className="w-3.5 h-3.5 text-blue-600 stroke-[1.5]" /> Em Separação
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-md text-xs font-medium">
            <Truck className="w-3.5 h-3.5 text-slate-600 stroke-[1.5]" /> Entregue
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-md text-xs font-medium">
            <XCircle className="w-3.5 h-3.5 text-rose-600 stroke-[1.5]" /> Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-md text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600 stroke-[1.5]" /> Aguardando
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-slate-700 stroke-[1.5]" /> Gestão de Pedidos
            </h1>
            <p className="text-xs text-slate-500">
              Filtre por CPF, nome do comprador ou código do pedido e atualize o status de entrega.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 stroke-[1.5] ${loading ? 'animate-spin' : ''}`} /> Atualizar Tabela
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Buscar por nome do cliente, CPF ou ID do pedido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.5]" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 stroke-[1.5]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="ALL">Todos os Status</option>
              <option value="PENDING">Aguardando Pagamento</option>
              <option value="PAID">Pago (PIX)</option>
              <option value="PROCESSING">Em Separação</option>
              <option value="DELIVERED">Entregue</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="p-4">ID Pedido</th>
                  <th className="p-4">Cliente & CPF</th>
                  <th className="p-4">Itens Comprados</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Alterar Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  [...Array(4)].map((_, i) => <TableRowSkeleton key={i} />)
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                      Nenhum pedido localizado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-semibold text-slate-900">
                        #{order.id.slice(0, 8)}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">
                          {new Date(order.created_at).toLocaleString('pt-BR')}
                        </span>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-slate-900">{order.cliente_nome}</p>
                        <p className="text-[11px] text-slate-500">CPF: {order.cliente_cpf}</p>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1 max-w-xs text-[11px]">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between gap-2">
                              <span className="truncate text-slate-700">
                                {item.quantidade}x {item.product?.nome || 'Produto'}
                              </span>
                              <span className="font-semibold text-slate-900">
                                {formatCurrency(Number(item.preco_unitario) * item.quantidade)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-4 font-bold text-slate-900">
                        {formatCurrency(Number(order.total_valor))}
                      </td>

                      <td className="p-4">{getStatusBadge(order.status)}</td>

                      <td className="p-4 text-right">
                        <select
                          disabled={updatingId === order.id}
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                        >
                          <option value="PENDING">Aguardando</option>
                          <option value="PAID">Pago (PIX)</option>
                          <option value="PROCESSING">Em Separação</option>
                          <option value="DELIVERED">Entregue</option>
                          <option value="CANCELLED">Cancelar</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
