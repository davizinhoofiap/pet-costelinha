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
        return <Bone className="w-3.5 h-3.5 stroke-[1.5]" />;
      case 'racoes-passaros':
        return <Feather className="w-3.5 h-3.5 stroke-[1.5]" />;
      case 'medicamentos-vermifugos':
        return <Pill className="w-3.5 h-3.5 stroke-[1.5]" />;
      case 'pulgas-carrapatos':
        return <ShieldAlert className="w-3.5 h-3.5 stroke-[1.5]" />;
      case 'acessorios-brinquedos':
        return <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" />;
      default:
        return <Grid className="w-3.5 h-3.5 stroke-[1.5]" />;
    }
  };

  return (
    <div className="my-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          Categorias de Produtos
        </h2>
        <span className="text-[11px] text-slate-500 font-normal">Filtre por departamento</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelectCategory('')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
            selectedCategory === ''
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Grid className="w-3.5 h-3.5 stroke-[1.5]" /> Todos os Produtos
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className={isSelected ? 'text-amber-400' : 'text-slate-500'}>
                {getIcon(cat.slug)}
              </span>
              {cat.nome}
            </button>
          );
        })}
      </div>
    </div>
  );
};
