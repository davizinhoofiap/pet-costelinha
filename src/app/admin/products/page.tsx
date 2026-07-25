'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Package, Plus, Edit2, Trash2, Search, X, AlertTriangle } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/masks';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [precoCusto, setPrecoCusto] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [estoque, setEstoque] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [destaque, setDestaque] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
        if (catData.length > 0) setCategoriaId(catData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setNome('');
    setDescricao('');
    setPrecoCusto('');
    setPrecoVenda('');
    setEstoque('10');
    setImagemUrl('https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80');
    setDestaque(false);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: any) => {
    setEditingId(prod.id);
    setNome(prod.nome);
    setDescricao(prod.descricao);
    setPrecoCusto(String(prod.preco_custo));
    setPrecoVenda(String(prod.preco_venda));
    setEstoque(String(prod.estoque));
    setCategoriaId(prod.categoria_id);
    setImagemUrl(prod.imagem_url);
    setDestaque(prod.destaque);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    try {
      const payload = {
        id: editingId,
        nome,
        descricao,
        preco_custo: precoCusto,
        preco_venda: precoVenda,
        estoque,
        categoria_id: categoriaId,
        imagem_url: imagemUrl,
        destaque,
      };

      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar produto');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setModalError(err.message || 'Erro ao salvar');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Confirma a exclusão deste produto do catálogo?')) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria?.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-700 stroke-[1.5]" /> Gestão de Estoque & Produtos
            </h1>
            <p className="text-xs text-slate-500">
              Controle de preços de custo, venda, estoque mínimo e cálculo de margem de lucro.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[1.5]" /> Cadastrar Produto
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar produto por nome ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.5]" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Custo</th>
                  <th className="p-4">Venda</th>
                  <th className="p-4">Margem de Lucro</th>
                  <th className="p-4">Estoque</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  [...Array(4)].map((_, i) => <TableRowSkeleton key={i} />)
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                      Nenhum produto cadastrado.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const custo = Number(prod.preco_custo);
                    const venda = Number(prod.preco_venda);
                    const margemReais = venda - custo;
                    const margemPercent = venda > 0 ? ((venda - custo) / venda) * 100 : 0;

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={prod.imagem_url}
                            alt={prod.nome}
                            className="w-9 h-9 object-contain bg-white rounded-lg p-0.5 border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{prod.nome}</p>
                            {prod.destaque && (
                              <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                Destaque
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 font-normal text-slate-500">
                          {prod.categoria?.nome || 'Geral'}
                        </td>

                        <td className="p-4 font-mono text-slate-500">
                          {formatCurrency(custo)}
                        </td>

                        <td className="p-4 font-mono font-bold text-slate-900">
                          {formatCurrency(venda)}
                        </td>

                        <td className="p-4 font-semibold text-emerald-700">
                          {formatCurrency(margemReais)}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            ({margemPercent.toFixed(1)}% margem)
                          </span>
                        </td>

                        <td className="p-4">
                          {prod.estoque <= 5 ? (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                              <AlertTriangle className="w-3 h-3 stroke-[1.5]" /> {prod.estoque} un. (Baixo)
                            </span>
                          ) : (
                            <span className="text-slate-700 font-medium">{prod.estoque} un.</span>
                          )}
                        </td>

                        <td className="p-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4 stroke-[1.5]" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.5]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 space-y-4 text-slate-900 relative shadow-xl">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingId ? 'Editar Especificações do Produto' : 'Cadastrar Novo Item'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>

              {modalError && (
                <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-semibold">
                  {modalError}
                </p>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria *</label>
                    <select
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Estoque Inicial (Unidades) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={estoque}
                      onChange={(e) => setEstoque(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preço de Custo (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={precoCusto}
                      onChange={(e) => setPrecoCusto(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preço de Venda (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={precoVenda}
                      onChange={(e) => setPrecoVenda(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Comercial</label>
                  <textarea
                    rows={2}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">URL da Imagem do Produto</label>
                  <input
                    type="url"
                    value={imagemUrl}
                    onChange={(e) => setImagemUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="destaqueCheck"
                    checked={destaque}
                    onChange={(e) => setDestaque(e.target.checked)}
                    className="w-4 h-4 accent-slate-900 rounded"
                  />
                  <label htmlFor="destaqueCheck" className="text-xs font-semibold text-slate-700">
                    Destacar na primeira página da loja
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    Salvar Produto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
