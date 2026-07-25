'use client';

import React, { useState, useMemo } from 'react';
import { ProductCard, ProductType } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  PackageX,
  Bone,
  Feather,
  Grid,
  ShieldAlert,
  ShoppingBag,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '@/lib/masks';

interface ProductCatalogSectionProps {
  products: ProductType[];
  categories: any[];
  loading: boolean;
  onAddToCart: (product: ProductType) => void;
}

const ITEMS_PER_PAGE = 20;

export const ProductCatalogSection: React.FC<ProductCatalogSectionProps> = ({
  products,
  categories,
  loading,
  onAddToCart,
}) => {
  // Filtros
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Mobile Filter Drawer Toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Icon mapper para categorias
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'caes':
        return <Bone className="w-4 h-4 stroke-[1.5]" />;
      case 'gatos':
        return <Feather className="w-4 h-4 stroke-[1.5]" />;
      case 'aves':
        return <Grid className="w-4 h-4 stroke-[1.5]" />;
      case 'higiene':
        return <ShieldAlert className="w-4 h-4 stroke-[1.5]" />;
      case 'acessorios':
        return <ShoppingBag className="w-4 h-4 stroke-[1.5]" />;
      default:
        return <Layers className="w-4 h-4 stroke-[1.5]" />;
    }
  };

  // Filtragem e Ordenação com Memoization
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Categoria
      if (selectedCategory && prod.categoria?.slug !== selectedCategory) {
        return false;
      }

      // Busca
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = prod.nome.toLowerCase().includes(term);
        const matchesDesc = prod.descricao.toLowerCase().includes(term);
        if (!matchesName && !matchesDesc) return false;
      }

      // Preço Mínimo
      const valVenda = Number(prod.preco_venda);
      if (minPrice && valVenda < Number(minPrice)) {
        return false;
      }

      // Preço Máximo
      if (maxPrice && valVenda > Number(maxPrice)) {
        return false;
      }

      // Apenas Estoque
      if (onlyInStock && prod.estoque <= 0) {
        return false;
      }

      // Apenas Destaque
      if (onlyFeatured && !prod.destaque) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = Number(a.preco_venda);
      const priceB = Number(b.preco_venda);

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'name') return a.nome.localeCompare(b.nome);
      return 0; // Default Destaque
    });
  }, [products, selectedCategory, searchTerm, minPrice, maxPrice, onlyInStock, onlyFeatured, sortBy]);

  // Cálculo da Paginação (Até 20 itens por página)
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const elem = document.getElementById('catalogo');
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setOnlyInStock(false);
    setOnlyFeatured(false);
    setSortBy('featured');
    setCurrentPage(1);
  };

  return (
    <div id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header do Catálogo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-orange-600 uppercase block font-semibold">
            [ LOJA COMERCIAL PET COSTELINHA ]
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Catálogo Oficial de Produtos
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rações, areias higiênicas, tapetes, gaiolas e acessórios com entrega rápida no seu bairro.
          </p>
        </div>

        {/* Mobile Filter Toggle & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[1.5]" />
            Filtros {selectedCategory ? '(1 Ativo)' : ''}
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold hidden sm:inline">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-900 font-semibold rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
            >
              <option value="featured">Relevância / Destaques</option>
              <option value="price-low">Menor Preço</option>
              <option value="price-high">Maior Preço</option>
              <option value="name">Nome (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Principal: Sidebar Filtros (Esquerda) + Cards Produtos (Direita) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: FILTROS LATERAIS (SIDEBAR) */}
        <aside
          className={`md:col-span-3 space-y-6 ${
            isMobileFilterOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-6 sticky top-24">
            
            {/* Header Filtros */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-600 stroke-[1.5]" /> Filtros Laterais
              </h3>

              {(selectedCategory || searchTerm || minPrice || maxPrice || onlyInStock || onlyFeatured) && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3 stroke-[1.5]" /> Limpar
                </button>
              )}
            </div>

            {/* Busca Rápida */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Buscar Produto
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nome da ração, sachê..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.5]" />
              </div>
            </div>

            {/* Categorias */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Categorias
              </label>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedCategory === ''
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 stroke-[1.5]" /> Todas as Categorias
                  </span>
                  <span className="text-[10px] font-mono opacity-80">({products.length})</span>
                </button>

                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  const catCount = products.filter((p) => p.categoria?.slug === cat.slug).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {getCategoryIcon(cat.slug)}
                        {cat.nome}
                      </span>
                      <span className="text-[10px] font-mono opacity-80">({catCount})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Faixa de Preço */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Faixa de Preço (R$)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <input
                  type="number"
                  placeholder="Máximo"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>

            {/* Filtros Booleanos */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => {
                    setOnlyInStock(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 accent-slate-900 rounded"
                />
                <span>Apenas Pronta Entrega</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyFeatured}
                  onChange={(e) => {
                    setOnlyFeatured(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 accent-orange-600 rounded"
                />
                <span>Apenas Destaques</span>
              </label>
            </div>

          </div>
        </aside>

        {/* COLUNA DIREITA: VITRINE DE PRODUTOS & PAGINAÇÃO */}
        <main className="md:col-span-9 space-y-6">
          
          {/* Informações de Resultado */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Exibindo <strong className="text-slate-900">{currentProducts.length}</strong> de{' '}
              <strong className="text-slate-900">{filteredProducts.length}</strong> produtos localizados
            </span>

            <span>
              Página <strong className="text-slate-900">{currentPage}</strong> de{' '}
              <strong className="text-slate-900">{totalPages}</strong>
            </span>
          </div>

          {/* Grid de Produtos (20 por página) */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 my-4 space-y-3">
              <PackageX className="w-10 h-10 text-slate-400 mx-auto stroke-[1.5]" />
              <h3 className="font-bold text-slate-800 text-sm">Nenhum produto localizado</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Não encontramos itens correspondentes aos filtros aplicados. Tente ajustar a busca.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Limpar Filtros de Busca
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
              ))}
            </div>
          )}

          {/* PAGINAÇÃO (Até 20 itens por página) */}
          {totalPages > 1 && (
            <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs">
              
              {/* Botão Anterior */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-xl font-bold transition-colors ${
                  currentPage === 1
                    ? 'text-slate-300 bg-slate-100 cursor-not-allowed'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4 stroke-[1.5]" /> Anterior
              </button>

              {/* Números das Páginas */}
              <div className="flex items-center gap-1.5">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = pageNum === currentPage;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-xl font-bold text-xs transition-colors flex items-center justify-center ${
                        isCurrent
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Botão Próximo */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-xl font-bold transition-colors ${
                  currentPage === totalPages
                    ? 'text-slate-300 bg-slate-100 cursor-not-allowed'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                Próximo <ChevronRight className="w-4 h-4 stroke-[1.5]" />
              </button>

            </div>
          )}

        </main>

      </div>
    </div>
  );
};
