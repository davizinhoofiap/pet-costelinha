'use client';

import React from 'react';
import { Bone, Feather, Pill, ShieldAlert, ShoppingBag, Grid } from 'lucide-react';

interface CategoryFilterProps {
  categories: { id: string; nome: string; slug: string; icone?: string }[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const getIcon = (slug: string) => {
    switch (slug) {
      case 'racoes-caes-gatos':
        return <Bone className="w-4 h-4 stroke-[2]" />;
      case 'racoes-passaros':
        return <Feather className="w-4 h-4 stroke-[2]" />;
      case 'medicamentos-vermifugos':
        return <Pill className="w-4 h-4 stroke-[2]" />;
      case 'pulgas-carrapatos':
        return <ShieldAlert className="w-4 h-4 stroke-[2]" />;
      case 'acessorios-brinquedos':
        return <ShoppingBag className="w-4 h-4 stroke-[2]" />;
      default:
        return <Grid className="w-4 h-4 stroke-[2]" />;
    }
  };

  return (
    <section className="my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">
            Navegue por Departamento
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Categorias de Produtos
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          Selecione uma categoria para filtrar o catálogo
        </span>
      </div>

      {/* Grade de Categorias em Estilo Figma Pill Cards */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-none">
        <button
          onClick={() => onSelectCategory('')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 border cursor-pointer ${
            selectedCategory === ''
              ? 'bg-emerald-950 text-amber-400 border-emerald-950 shadow-md scale-102'
              : 'bg-white text-slate-700 border-slate-200/90 hover:border-amber-400 hover:bg-amber-50/40 shadow-2xs'
          }`}
        >
          <Grid className="w-4 h-4 stroke-[2]" /> Todos os Produtos
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? 'bg-emerald-950 text-amber-400 border-emerald-950 shadow-md scale-102'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:border-amber-400 hover:bg-amber-50/40 shadow-2xs'
              }`}
            >
              <span className={isSelected ? 'text-amber-400' : 'text-amber-600'}>
                {getIcon(cat.slug)}
              </span>
              {cat.nome}
            </button>
          );
        })}
      </div>
    </section>
  );
};
