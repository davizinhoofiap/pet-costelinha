'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  PackageCheck, 
  Truck, 
  XCircle, 
  Eye, 
  X, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  CheckSquare 
} from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/masks';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Estado para Modal de Detalhes
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDetails = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[1.5]" /> Aguardando Envio (Pago)
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-md text-xs font-semibold">
            <PackageCheck className="w-3.5 h-3.5 text-blue-600 stroke-[1.5]" /> Em Separação
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-md text-xs font-semibold">
            <Truck className="w-3.5 h-3.5 text-purple-600 stroke-[1.5]" /> Saiu para Entrega
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-md text-xs font-semibold">
            <Truck className="w-3.5 h-3.5 text-slate-600 stroke-[1.5]" /> Entregue
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-md text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5 text-rose-600 stroke-[1.5]" /> Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-md text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-600 stroke-[1.5]" /> Aguardando Pagamento
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
              Filtre por CPF, nome do comprador ou código do pedido e atualize os status de entrega.
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
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
            >
              <option value="ALL">Todos os Status</option>
              <option value="PENDING">Aguardando Pagamento</option>
              <option value="PAID">Aguardando Envio (Pago)</option>
              <option value="PROCESSING">Em Separação</option>
              <option value="SHIPPED">Saiu para Entrega</option>
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
                  <th className="p-4 text-right">Ações / Status</th>
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
                    <tr 
                      key={order.id} 
                      onClick={() => handleOpenDetails(order)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
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

                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(order)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            title="Ver Detalhes do Pedido"
                          >
                            <Eye className="w-4 h-4 stroke-[1.5]" />
                          </button>

                          <select
                            disabled={updatingId === order.id}
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                          >
                            <option value="PENDING">Aguardando Pagamento</option>
                            <option value="PAID">Aguardando Envio</option>
                            <option value="PROCESSING">Em Separação</option>
                            <option value="SHIPPED">Saiu para Entrega</option>
                            <option value="DELIVERED">Entregue</option>
                            <option value="CANCELLED">Cancelado</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DE DETALHES DO PEDIDO NO ADMIN */}
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative my-6">
              {/* Header Modal */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-xl">
                    <FileText className="w-5 h-5 text-white stroke-[1.5]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      Detalhes do Pedido #{selectedOrder.id.slice(0, 8)}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Realizado em {new Date(selectedOrder.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                {/* Status Bar */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Status Atual do Pedido:
                    </span>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Botão Rápido: Marcar Como Entregue */}
                    <button
                      type="button"
                      disabled={selectedOrder.status === 'DELIVERED' || updatingId === selectedOrder.id}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <CheckSquare className="w-4 h-4 stroke-[1.5]" />
                      Marcar como Entregue
                    </button>

                    <select
                      value={selectedOrder.status}
                      disabled={updatingId === selectedOrder.id}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                    >
                      <option value="PENDING">Aguardando Pagamento</option>
                      <option value="PAID">Aguardando Envio</option>
                      <option value="PROCESSING">Em Separação</option>
                      <option value="SHIPPED">Saiu para Entrega</option>
                      <option value="DELIVERED">Entregue</option>
                      <option value="CANCELLED">Cancelado</option>
                    </select>
                  </div>
                </div>

                {/* 1. Dados do Cliente */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-500 stroke-[1.5]" /> 1. Dados do Comprador
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Nome Completo:</span>
                      <p className="font-bold text-slate-900">{selectedOrder.cliente_nome}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">CPF:</span>
                      <p className="font-bold text-slate-900">{selectedOrder.cliente_cpf}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">E-mail:</span>
                      <p className="font-medium text-slate-800 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400 stroke-[1.5]" /> {selectedOrder.cliente_email}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Telefone / WhatsApp:</span>
                      <a
                        href={`https://wa.me/55${(selectedOrder.cliente_cpf || '').replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-emerald-700 flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-3 h-3 text-emerald-600 stroke-[1.5]" /> {selectedOrder.cliente_telefone || 'Não Informado'}
                      </a>
                    </div>
                  </div>
                </div>

                {/* 2. Endereço de Entrega Completo */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-600 stroke-[1.5]" /> 2. Endereço de Entrega
                  </h3>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                    <p className="font-semibold text-slate-900 leading-relaxed">
                      {selectedOrder.endereco_entrega}
                    </p>
                  </div>
                </div>

                {/* 3. Lista de Itens Comprados */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    3. Itens do Pedido ({selectedOrder.items?.length || 0})
                  </h3>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-200">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="p-3 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{item.product?.nome || 'Produto'}</p>
                          <p className="text-[11px] text-slate-500">
                            {item.quantidade}x {formatCurrency(Number(item.preco_unitario))} un.
                          </p>
                        </div>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(Number(item.preco_unitario) * item.quantidade)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Resumo de Valores e Pagamento */}
                <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Método de Pagamento:</span>
                    <span className="font-bold text-emerald-400">PIX Mercado Pago</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Frete / Entrega:</span>
                    <span className="font-semibold text-white">Gratuito (Entrega Expressa)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-sm">
                    <span>Valor Total do Pedido:</span>
                    <span className="text-emerald-400 text-base">
                      {formatCurrency(Number(selectedOrder.total_valor))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
