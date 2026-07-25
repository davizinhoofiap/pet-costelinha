'use client';

import React, { useState } from 'react';
import { Star, ShoppingBag, Check, Eye } from 'lucide-react';
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
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden relative cursor-pointer font-sans"
    >
      {/* Badges */}
      {product.destaque && (
        <span className="absolute top-3 left-3 z-10 bg-slate-900 text-orange-400 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md uppercase">
          [ DESTAQUE ]
        </span>
      )}

      {product.estoque <= 5 && product.estoque > 0 && (
        <span className="absolute top-3 right-3 z-10 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
          Últimas {product.estoque} un.
        </span>
      )}

      {/* Image Container Padronizado */}
      <div className="relative aspect-square w-full bg-slate-50/60 p-5 flex items-center justify-center overflow-hidden">
        <img
          src={product.imagem_url}
          alt={product.nome}
          className="w-full h-full object-contain group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />

        {/* Hover Eye Overlay */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/90 text-slate-900 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5 text-orange-600 stroke-[1.5]" /> Ver Detalhes
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] font-mono font-bold text-orange-600 uppercase tracking-wider block mb-1">
            {product.categoria?.nome || 'PET COSTELINHA'}
          </span>

          <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
            {product.nome}
          </h3>

          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-normal">
            {product.descricao}
          </p>

          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400 stroke-[1.5]" />
            ))}
            <span className="text-[10px] text-slate-400 font-medium ml-1">(5.0)</span>
          </div>
        </div>

        {/* CRO Price & Wide CTA Button */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-slate-400 font-medium uppercase">Preço à vista</span>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(product.preco_venda)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.estoque === 0}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-98 ${
              product.estoque === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : added
                ? 'bg-emerald-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 stroke-[2]" /> Adicionado
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 stroke-[1.5]" /> Comprar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
