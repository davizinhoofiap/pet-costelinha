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
  Package,
  Pencil,
  Trash2,
  AlertTriangle
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

  // Estado para Modal de Detalhes da Ficha
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Estado para Modal de Edição (Ícone de Lápis)
  const [editOrder, setEditOrder] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    cliente_nome: '',
    cliente_email: '',
    cliente_telefone: '',
    endereco_entrega: '',
    status: '',
  });

  // Estado para Modal de Confirmação de Exclusão (Ícone de Lixeira)
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
      console.error('Erro ao buscar pedidos:', err);
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

  // Abrir Modal de Edição (Lápis)
  const handleOpenEdit = (order: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditOrder(order);
    setEditForm({
      cliente_nome: order.cliente_nome || '',
      cliente_email: order.cliente_email || '',
      cliente_telefone: order.cliente_telefone || '',
      endereco_entrega: order.endereco_entrega || '',
      status: order.status || 'PENDING',
    });
    setIsEditModalOpen(true);
  };

  // Salvar Alterações de Edição
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrder) return;

    try {
      setUpdatingId(editOrder.id);
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: editOrder.id,
          ...editForm,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === editOrder.id ? { ...o, ...updated } : o))
        );
        if (selectedOrder && selectedOrder.id === editOrder.id) {
          setSelectedOrder((prev: any) => ({ ...prev, ...updated }));
        }
        setIsEditModalOpen(false);
        showToast('Informações do pedido atualizadas!');
      } else {
        showToast('Erro ao atualizar o pedido.');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro de comunicação com o servidor.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Abrir Modal de Exclusão (Lixeira)
  const handleOpenDelete = (order: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  // Confirmar Exclusão no Banco de Dados
  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/orders?orderId=${orderToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
        if (selectedOrder && selectedOrder.id === orderToDelete.id) {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }
        setIsDeleteModalOpen(false);
        setOrderToDelete(null);
        showToast('Pedido excluído do banco de dados com sucesso!');
      } else {
        showToast('Erro ao excluir o pedido do banco de dados.');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao conectar com o servidor para exclusão.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> PAGO / PREPARAÇÃO
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide shadow-2xs">
            <PackageCheck className="w-3.5 h-3.5 text-blue-600 stroke-[2]" /> EM PREPARAÇÃO
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide shadow-2xs">
            <Truck className="w-3.5 h-3.5 text-purple-600 stroke-[2]" /> EM ENTREGA
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-900 border border-slate-300 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide shadow-2xs">
            <Truck className="w-3.5 h-3.5 text-slate-700 stroke-[2]" /> ENTREGUE
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600 stroke-[2]" /> CANCELADO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 stroke-[2]" /> AGUARDANDO PAGAMENTO
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

        {/* CONTAINER DA TABELA DE PEDIDOS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse table-auto">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200/80">
                <tr>
                  <th className="py-4 px-4 whitespace-nowrap w-[130px]">ID Pedido</th>
                  <th className="py-4 px-4 whitespace-nowrap w-[200px]">Cliente & CPF</th>
                  <th className="py-4 px-4 whitespace-nowrap">Itens Comprados</th>
                  <th className="py-4 px-4 whitespace-nowrap w-[110px]">Total</th>
                  <th className="py-4 px-4 whitespace-nowrap w-[200px]">Status da Entrega</th>
                  <th className="py-4 px-4 whitespace-nowrap text-right w-[120px]">AÇÕES</th>
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
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        #{order.id.slice(0, 8)}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                          {new Date(order.created_at).toLocaleString('pt-BR')}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[180px]">{order.cliente_nome}</p>
                        <p className="text-[11px] text-slate-500 font-medium">CPF: {order.cliente_cpf}</p>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1 text-xs">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="text-slate-700 font-medium truncate max-w-[240px]">
                              • {item.quantidade}x {item.product?.nome || 'Produto'}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono font-black text-slate-900 text-sm whitespace-nowrap">
                        {formatCurrency(Number(order.total_valor))}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>

                      {/* COLUNA DE AÇÕES NO CANTO DIREITO (EDITAR E EXCLUIR) */}
                      <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(order)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Ver Ficha Detalhada"
                          >
                            <FileText className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(order, e)}
                            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                            title="Editar Pedido e Status"
                          >
                            <Pencil className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleOpenDelete(order, e)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                            title="Excluir Pedido do Banco de Dados"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL 1: EDITAR PEDIDO (LÁPIS) */}
        {isEditModalOpen && editOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 relative my-6">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Pencil className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      Editar Pedido #{editOrder.id.slice(0, 8)}
                    </h2>
                    <p className="text-[11px] text-slate-400">Atualize dados do comprador ou status</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    required
                    value={editForm.cliente_nome}
                    onChange={(e) => setEditForm({ ...editForm, cliente_nome: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      required
                      value={editForm.cliente_email}
                      onChange={(e) => setEditForm({ ...editForm, cliente_email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={editForm.cliente_telefone}
                      onChange={(e) => setEditForm({ ...editForm, cliente_telefone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Endereço de Entrega</label>
                  <textarea
                    rows={2}
                    required
                    value={editForm.endereco_entrega}
                    onChange={(e) => setEditForm({ ...editForm, endereco_entrega: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status da Entrega</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                  >
                    <option value="PENDING">AGUARDANDO PAGAMENTO</option>
                    <option value="PAID">PAGO / AGUARDANDO PREPARAÇÃO</option>
                    <option value="PROCESSING">EM PREPARAÇÃO (ESTOQUE)</option>
                    <option value="SHIPPED">ENVIADO / SAIU PARA ENTREGA</option>
                    <option value="DELIVERED">ENTREGUE AO CLIENTE</option>
                    <option value="CANCELLED">CANCELADO</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: CONFIRMAÇÃO DE EXCLUSÃO DO BANCO DE DADOS (LIXEIRA) */}
        {isDeleteModalOpen && orderToDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 stroke-[2]" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900">
                  Excluir Pedido #{orderToDelete.id.slice(0, 8)}?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tem certeza que deseja apagar o pedido do cliente <strong>{orderToDelete.cliente_nome}</strong> do banco de dados? Esta ação é permanente para evitar superlotação.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Valor do Pedido:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(Number(orderToDelete.total_valor))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data de Criação:</span>
                  <span className="font-medium text-slate-700">{new Date(orderToDelete.created_at).toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" /> Confirmar Exclusão
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: FICHA COMPLETA DE EXPEDIÇÃO */}
        {isDetailsModalOpen && selectedOrder && (
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
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Etapa Atual da Entrega:
                    </span>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
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

                <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Comprovante de Pagamento:</span>
                    <span className="font-bold text-emerald-400">{selectedOrder.metodo_pagamento || 'PIX Mercado Pago'}</span>
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
