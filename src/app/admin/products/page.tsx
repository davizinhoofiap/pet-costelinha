'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Package, Plus, Edit2, Trash2, Search, X, AlertTriangle, Filter, Sparkles, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/masks';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado de Seleção em Lote (Bulk Select)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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
        setSelectedProductIds([]);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
        if (catData.length > 0 && !categoriaId) setCategoriaId(catData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria?.nome.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = 
      selectedCategoryFilter === 'ALL' || p.categoria_id === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Funções de Seleção em Massa (Bulk Selection)
  const isAllSelected = filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelectProduct = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;

    try {
      setIsDeleting(true);
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: selectedProductIds }),
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => !selectedProductIds.includes(p.id)));
        showToast(`${selectedProductIds.length} produto(s) excluído(s) do catálogo com sucesso!`);
        setSelectedProductIds([]);
        setIsBulkDeleteModalOpen(false);
      } else {
        showToast('Erro ao excluir produtos selecionados.');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao conectar ao servidor.');
    } finally {
      setIsDeleting(false);
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
    if (categories.length > 0) setCategoriaId(categories[0].id);
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
      showToast(editingId ? 'Produto atualizado com sucesso!' : 'Novo produto cadastrado no estoque!');
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
        setSelectedProductIds((prev) => prev.filter((item) => item !== id));
        showToast('Produto excluído com sucesso!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 font-sans max-w-7xl mx-auto relative">
        {/* TOAST DE NOTIFICAÇÃO */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" /> {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
              <Package className="w-6 h-6 text-slate-800 stroke-[1.5]" /> Gestão de Estoque & Produtos
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Visualize, edite preços de custo/venda, altere estoque e cadastre novos itens no catálogo da loja.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-98 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2]" /> Cadastrar Novo Produto
          </button>
        </div>

        {/* Filtros, Busca e Controle de Seleção Simplificado */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Botão de Selecionar Todos / Excluir Selecionados Compacto */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isAllSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={() => {}}
                className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 cursor-pointer pointer-events-none"
              />
              <span>Selecionar Todos ({filteredProducts.length})</span>
            </button>

            {selectedProductIds.length > 0 && (
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                Excluir Selecionados ({selectedProductIds.length})
              </button>
            )}
          </div>

          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Buscar por nome do produto ou especificações..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[1.5]" />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <Filter className="w-4 h-4 text-slate-400 stroke-[1.5]" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer w-full md:w-auto"
            >
              <option value="ALL">Todas as Categorias ({products.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela Espaçosa e Legível */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden max-w-full">
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-left text-xs border-collapse table-auto">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200/80">
                <tr>
                  <th className="py-4 px-3.5 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                      title="Selecionar Todos os Produtos"
                    />
                  </th>
                  <th className="py-4 px-5 min-w-[280px]">Produto & Foto</th>
                  <th className="py-4 px-5 min-w-[140px]">Categoria</th>
                  <th className="py-4 px-5 min-w-[120px]">Preço de Custo</th>
                  <th className="py-4 px-5 min-w-[130px]">Preço de Venda</th>
                  <th className="py-4 px-5 min-w-[150px]">Margem de Lucro</th>
                  <th className="py-4 px-5 min-w-[130px]">Estoque</th>
                  <th className="py-4 px-5 text-right min-w-[120px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  [...Array(4)].map((_, i) => <TableRowSkeleton key={i} />)
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-500 font-medium">
                      Nenhum produto localizado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const custo = Number(prod.preco_custo);
                    const venda = Number(prod.preco_venda);
                    const margemReais = venda - custo;
                    const margemPercent = venda > 0 ? ((venda - custo) / venda) * 100 : 0;
                    const isSelected = selectedProductIds.includes(prod.id);

                    return (
                      <tr 
                        key={prod.id} 
                        className={`transition-colors ${
                          isSelected ? 'bg-slate-100/90 hover:bg-slate-100' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-4 px-3.5 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelectProduct(prod.id, e as any)}
                            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                          />
                        </td>

                        <td className="py-4 px-5 flex items-center gap-3.5">
                          <img
                            src={prod.imagem_url}
                            alt={prod.nome}
                            className="w-12 h-12 object-contain bg-white rounded-xl p-1 border border-slate-200 shrink-0 shadow-2xs"
                          />
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 text-xs leading-snug">{prod.nome}</p>
                            {prod.destaque && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                <Sparkles className="w-3 h-3 text-amber-600 stroke-[1.5]" /> Destaque Loja
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <span className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-lg text-[11px]">
                            {prod.categoria?.nome || 'Geral'}
                          </span>
                        </td>

                        <td className="py-4 px-5 font-mono text-slate-500">
                          {formatCurrency(custo)}
                        </td>

                        <td className="py-4 px-5 font-mono font-black text-slate-900 text-sm">
                          {formatCurrency(venda)}
                        </td>

                        <td className="py-4 px-5">
                          <span className="font-bold text-emerald-700 block text-xs">
                            +{formatCurrency(margemReais)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-medium block">
                            ({margemPercent.toFixed(1)}% margem)
                          </span>
                        </td>

                        <td className="py-4 px-5">
                          {prod.estoque <= 5 ? (
                            <span className="bg-rose-50 text-rose-800 border border-rose-200 font-bold px-2.5 py-1 rounded-lg text-[11px] inline-flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> {prod.estoque} un (Baixo)
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-1 rounded-lg text-[11px]">
                              {prod.estoque} un no estoque
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Editar Produto"
                          >
                            <Edit2 className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                            title="Excluir Produto"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
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

        {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO EM MASSA DE PRODUTOS */}
        {isBulkDeleteModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 stroke-[2]" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900">
                  Excluir {selectedProductIds.length} {selectedProductIds.length === 1 ? 'Produto Selecionado' : 'Produtos Selecionados'}?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tem certeza que deseja apagar <strong>{selectedProductIds.length} {selectedProductIds.length === 1 ? 'produto selecionado' : 'produtos selecionados'}</strong> do catálogo da loja? Esta ação é irreversível.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmBulkDelete}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Adicionar / Editar Produto */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 relative my-6">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-800 rounded-xl">
                    <Package className="w-5 h-5 text-white stroke-[1.5]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {editingId ? 'Editar Produto do Catálogo' : 'Cadastrar Novo Produto no Estoque'}
                    </h2>
                    <p className="text-[11px] text-slate-400">Preencha os dados comerciais e de estoque</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-5 space-y-4 text-xs">
                {modalError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold">
                    {modalError}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Ração Magnus Todo Dia Carne 15kg"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Descrição Comercial</label>
                  <textarea
                    rows={2}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Detalhes sobre o produto, sabor, raça recomendada..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Preço de Custo (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={precoCusto}
                      onChange={(e) => setPrecoCusto(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Preço de Venda (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={precoVenda}
                      onChange={(e) => setPrecoVenda(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estoque (Unidades) *</label>
                    <input
                      type="number"
                      required
                      value={estoque}
                      onChange={(e) => setEstoque(e.target.value)}
                      placeholder="10"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Categoria *</label>
                    <select
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">URL da Imagem</label>
                    <input
                      type="text"
                      value={imagemUrl}
                      onChange={(e) => setImagemUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="destaque"
                    checked={destaque}
                    onChange={(e) => setDestaque(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                  />
                  <label htmlFor="destaque" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Destacar produto na vitrine principal da loja
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    {editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
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
