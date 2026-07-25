'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Package, Plus, Edit2, Trash2, Search, X, AlertTriangle, Filter, Sparkles, Image as ImageIcon } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/masks';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

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
        if (catData.length > 0 && !categoriaId) setCategoriaId(catData[0].id);
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

  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria?.nome.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = 
      selectedCategoryFilter === 'ALL' || p.categoria_id === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="space-y-6 font-sans max-w-7xl mx-auto">
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

        {/* Filtros e Busca */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Buscar por nome do produto ou especificações..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[1.5]" />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 stroke-[1.5]" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer w-full md:w-auto"
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
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200/80">
                <tr>
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
                    <td colSpan={7} className="p-12 text-center text-slate-500 font-medium">
                      Nenhum produto localizado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const custo = Number(prod.preco_custo);
                    const venda = Number(prod.preco_venda);
                    const margemReais = venda - custo;
                    const margemPercent = venda > 0 ? ((venda - custo) / venda) * 100 : 0;

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
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
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg text-[11px] font-extrabold">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 stroke-[1.5]" /> {prod.estoque} un. (Baixo)
                            </span>
                          ) : (
                            <span className="text-slate-900 font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px]">
                              {prod.estoque} un.
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(prod)}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            title="Editar Especificações"
                          >
                            <Edit2 className="w-4 h-4 stroke-[1.5]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Excluir Produto"
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

        {/* MODAL DE CADASTRO / EDIÇÃO ESPAÇOSO E ORGANIZADO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl p-6 space-y-5 text-slate-900 relative shadow-2xl my-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-900 text-white rounded-xl">
                    <Package className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {editingId ? 'Editar Produto' : 'Cadastrar Novo Item no Estoque'}
                    </h3>
                    <p className="text-[11px] text-slate-400">Preencha as especificações comerciais</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {modalError && (
                <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold">
                  {modalError}
                </p>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-4">
                {/* Nome do Produto */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Comercial do Produto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ração Premier Cães Adultos 15kg"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
                  />
                </div>

                {/* Categoria e Estoque */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Categoria *</label>
                    <select
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estoque (Unidades) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={estoque}
                      onChange={(e) => setEstoque(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-bold"
                    />
                  </div>
                </div>

                {/* Preço de Custo e Preço de Venda */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preço de Custo (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={precoCusto}
                      onChange={(e) => setPrecoCusto(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preço de Venda (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={precoVenda}
                      onChange={(e) => setPrecoVenda(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>

                {/* Descrição Comercial */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Descrição Comercial</label>
                  <textarea
                    rows={2}
                    placeholder="Resumo dos benefícios e características do produto..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                {/* URL da Imagem + Preview */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">URL da Imagem do Produto</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={imagemUrl}
                      onChange={(e) => setImagemUrl(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                    {imagemUrl ? (
                      <img
                        src={imagemUrl}
                        alt="Preview"
                        className="w-10 h-10 object-contain bg-white border border-slate-200 rounded-lg shrink-0 p-0.5"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                        <ImageIcon className="w-5 h-5 stroke-[1.5]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkbox Destaque */}
                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="destaqueCheck"
                    checked={destaque}
                    onChange={(e) => setDestaque(e.target.checked)}
                    className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
                  />
                  <label htmlFor="destaqueCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Destacar na primeira página da loja (Destaques da Semana)
                  </label>
                </div>

                {/* Botoes de Ação */}
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
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
