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
  X, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  CheckSquare,
  Package
} from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/masks';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado para Modal de Detalhes
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

        showToast('Status da entrega atualizado com sucesso!');
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
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-black tracking-wide shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2]" /> PAGO / AGUARDANDO PREPARAÇÃO
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-lg text-xs font-black tracking-wide shadow-2xs">
            <PackageCheck className="w-4 h-4 text-blue-600 stroke-[2]" /> EM PREPARAÇÃO (ESTOQUE)
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1 rounded-lg text-xs font-black tracking-wide shadow-2xs">
            <Truck className="w-4 h-4 text-purple-600 stroke-[2]" /> ENVIADO / SAIU PARA ENTREGA
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-900 border border-slate-300 px-3 py-1 rounded-lg text-xs font-black tracking-wide shadow-2xs">
            <Truck className="w-4 h-4 text-slate-700 stroke-[2]" /> ENTREGUE AO CLIENTE
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-lg text-xs font-black tracking-wide shadow-2xs">
            <XCircle className="w-4 h-4 text-rose-600 stroke-[2]" /> CANCELADO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-lg text-xs font-black tracking-wide shadow-2xs">
            <Clock className="w-4 h-4 text-amber-600 stroke-[2]" /> AGUARDANDO PAGAMENTO
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="w-full space-y-6 font-sans relative">
        {/* TOAST DE NOTIFICAÇÃO */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" /> {toastMessage}
          </div>
        )}

        {/* Header Amplo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
              <ShoppingCart className="w-6 h-6 text-slate-800 stroke-[1.5]" /> Gestão e Expedição de Pedidos
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Painel operacional completo para Gerente e Atendentes. Acompanhe do pagamento até a entrega ao cliente.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 stroke-[1.5] ${loading ? 'animate-spin' : ''}`} /> Atualizar Tabela
          </button>
        </div>

        {/* Filters Amplos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Buscar por nome do cliente, CPF ou ID do pedido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[1.5]" />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 stroke-[1.5]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer w-full md:w-auto"
            >
              <option value="ALL">Todos os Status ({orders.length})</option>
              <option value="PENDING">AGUARDANDO PAGAMENTO</option>
              <option value="PAID">PAGO / AGUARDANDO PREPARAÇÃO</option>
              <option value="PROCESSING">EM PREPARAÇÃO (ESTOQUE)</option>
              <option value="SHIPPED">ENVIADO / SAIU PARA ENTREGA</option>
              <option value="DELIVERED">ENTREGUE AO CLIENTE</option>
              <option value="CANCELLED">CANCELADO</option>
            </select>
          </div>
        </div>

        {/* Table Ampla e Espaçosa */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200/80">
                <tr>
                  <th className="py-4.5 px-5 min-w-[140px]">ID Pedido</th>
                  <th className="py-4.5 px-5 min-w-[200px]">Cliente & CPF</th>
                  <th className="py-4.5 px-5 min-w-[260px]">Itens Comprados</th>
                  <th className="py-4.5 px-5 min-w-[130px]">Total Pago</th>
                  <th className="py-4.5 px-5 min-w-[240px]">Status da Entrega</th>
                  <th className="py-4.5 px-5 text-right min-w-[260px]">Ações / Etapa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  [...Array(4)].map((_, i) => <TableRowSkeleton key={i} />)
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500 font-medium">
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
                      <td className="py-4.5 px-5 font-mono font-bold text-slate-900">
                        #{order.id.slice(0, 8)}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                          {new Date(order.created_at).toLocaleString('pt-BR')}
                        </span>
                      </td>

                      <td className="py-4.5 px-5">
                        <p className="font-bold text-slate-900 text-xs">{order.cliente_nome}</p>
                        <p className="text-[11px] text-slate-500 font-medium">CPF: {order.cliente_cpf}</p>
                      </td>

                      <td className="py-4.5 px-5">
                        <div className="space-y-1 max-w-sm text-xs">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between gap-2">
                              <span className="truncate text-slate-700 font-medium">
                                {item.quantidade}x {item.product?.nome || 'Produto'}
                              </span>
                              <span className="font-bold text-slate-900 shrink-0">
                                {formatCurrency(Number(item.preco_unitario) * item.quantidade)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-4.5 px-5 font-mono font-black text-slate-900 text-sm">
                        {formatCurrency(Number(order.total_valor))}
                      </td>

                      <td className="py-4.5 px-5">{getStatusBadge(order.status)}</td>

                      <td className="py-4.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(order)}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <FileText className="w-4 h-4 stroke-[1.5]" /> Ficha do Pedido
                          </button>

                          <select
                            disabled={updatingId === order.id}
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                          >
                            <option value="PENDING">AGUARDANDO PAGAMENTO</option>
                            <option value="PAID">PAGO / AGUARDANDO PREPARAÇÃO</option>
                            <option value="PROCESSING">EM PREPARAÇÃO (ESTOQUE)</option>
                            <option value="SHIPPED">ENVIADO / SAIU PARA ENTREGA</option>
                            <option value="DELIVERED">ENTREGUE AO CLIENTE</option>
                            <option value="CANCELLED">CANCELADO</option>
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

        {/* MODAL DE DETALHES / GAVETA DO PEDIDO NO ADMIN */}
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 relative my-6">
              {/* Header Modal */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-xl">
                    <FileText className="w-5 h-5 text-white stroke-[1.5]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      Ficha de Expedição #{selectedOrder.id.slice(0, 8)}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Criado em {new Date(selectedOrder.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
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
                      Etapa Atual da Entrega:
                    </span>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Botão Rápido: Marcar Como Entregue */}
                    <button
                      type="button"
                      disabled={selectedOrder.status === 'DELIVERED' || updatingId === selectedOrder.id}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <CheckSquare className="w-4 h-4 stroke-[1.5]" />
                      MARCAR COMO ENTREGUE
                    </button>

                    <select
                      value={selectedOrder.status}
                      disabled={updatingId === selectedOrder.id}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                    >
                      <option value="PENDING">AGUARDANDO PAGAMENTO</option>
                      <option value="PAID">PAGO / AGUARDANDO PREPARAÇÃO</option>
                      <option value="PROCESSING">EM PREPARAÇÃO (ESTOQUE)</option>
                      <option value="SHIPPED">ENVIADO / SAIU PARA ENTREGA</option>
                      <option value="DELIVERED">ENTREGUE AO CLIENTE</option>
                      <option value="CANCELLED">CANCELADO</option>
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
                        <Phone className="w-3 h-3 text-emerald-600 stroke-[1.5]" /> {selectedOrder.cliente_telefone || 'Abrir WhatsApp'}
                      </a>
                    </div>
                  </div>
                </div>

                {/* 2. Endereço de Entrega Completo */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-600 stroke-[1.5]" /> 2. Endereço Completo de Entrega
                  </h3>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="font-bold text-slate-900 leading-relaxed">
                      {selectedOrder.endereco_entrega}
                    </p>
                  </div>
                </div>

                {/* 3. Lista dos Produtos com Foto e Quantidade */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-blue-600 stroke-[1.5]" /> 3. Produtos Comprados ({selectedOrder.items?.length || 0})
                  </h3>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-200">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="p-3 flex justify-between items-center text-xs gap-3">
                        <div className="flex items-center gap-3">
                          {item.product?.imagem_url ? (
                            <img
                              src={item.product.imagem_url}
                              alt={item.product.nome}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                              <Package className="w-5 h-5 text-slate-400 stroke-[1.5]" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{item.product?.nome || 'Produto'}</p>
                            <p className="text-[11px] text-slate-500">
                              Qtd: <strong>{item.quantidade}x</strong> | Valor un: {formatCurrency(Number(item.preco_unitario))}
                            </p>
                          </div>
                        </div>
                        <span className="font-extrabold text-slate-900 shrink-0">
                          {formatCurrency(Number(item.preco_unitario) * item.quantidade)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Comprovante e Resumo Financeiro */}
                <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Comprovante de Pagamento:</span>
                    <span className="font-bold text-emerald-400">PIX Mercado Pago (Confirmado)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Modalidade de Entrega:</span>
                    <span className="font-semibold text-white">Frete Grátis (Expedição Expressa)</span>
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
