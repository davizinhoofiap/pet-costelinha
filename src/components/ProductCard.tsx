'use client';

import React, { useState } from 'react';
import { Star, ShoppingBag, Check, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/masks';

export interface ProductType {
  id: string;
  nome: string;
  descricao: string;
  preco_custo: number | string;
  preco_venda: number | string;
  estoque: number;
  imagem_url: string;
  destaque?: boolean;
  categoria?: { nome: string; slug: string };
}

interface ProductCardProps {
  product: ProductType;
  onAddToCart: (product: ProductType) => void;
  onOpenDetails?: (product: ProductType) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenDetails,
}) => {
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      onClick={() => onOpenDetails && onOpenDetails(product)}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden relative cursor-pointer font-sans"
    >
      {/* Container de Badges Superiores (Sem colisão de texto) */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-1.5 pointer-events-none">
        {product.destaque ? (
          <span className="inline-flex items-center gap-1 bg-slate-900 text-amber-400 text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-400 stroke-[2]" /> DESTAQUE
          </span>
        ) : <span />}

        {product.estoque <= 5 && product.estoque > 0 && (
          <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-2xs">
            Últimas {product.estoque} un.
          </span>
        )}
      </div>

      {/* Container da Foto Limpo e Padronizado (Sem Olho no Hover) */}
      <div className="relative h-52 sm:h-56 w-full bg-slate-50/70 p-4 flex items-center justify-center overflow-hidden">
        <img
          src={product.imagem_url}
          alt={product.nome}
          className="max-h-full max-w-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Conteúdo Informativo Espaçoso */}
      <div className="p-4.5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block mb-1">
            {product.categoria?.nome || 'PET COSTELINHA'}
          </span>

          <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors min-h-[2.25rem]">
            {product.nome}
          </h3>

          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 font-normal leading-relaxed">
            {product.descricao}
          </p>

          <div className="flex items-center gap-1 mt-2.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 stroke-[1.5]" />
            ))}
            <span className="text-[10px] text-slate-400 font-bold ml-1.5">(5.0)</span>
          </div>
        </div>

        {/* Preço e Botão de Compra Direta */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">À vista no PIX</span>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(product.preco_venda)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.estoque === 0}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-98 cursor-pointer ${
              product.estoque === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : added
                ? 'bg-emerald-700 text-white shadow-emerald-700/20'
                : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" /> Adicionado ao Carrinho
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 stroke-[2]" /> Comprar Agora
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
