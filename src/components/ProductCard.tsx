'use client';

import React, { useState } from 'react';
import { Star, ShoppingBag, Check, Sparkles, ShieldCheck } from 'lucide-react';
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
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div
      onClick={() => onOpenDetails && onOpenDetails(product)}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between overflow-hidden relative cursor-pointer font-sans transform hover:-translate-y-1"
    >
      {/* Badges Flutuantes Superiores */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-1.5 pointer-events-none">
        {product.destaque ? (
          <span className="inline-flex items-center gap-1 bg-emerald-950 text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md border border-amber-400/30">
            <Sparkles className="w-3 h-3 text-amber-400 stroke-[2.5]" /> DESTAQUE
          </span>
        ) : (
          <span />
        )}

        {product.estoque <= 5 && product.estoque > 0 && (
          <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg shadow-xs">
            Poucas unidades!
          </span>
        )}
      </div>

      {/* Container da Imagem com Efeito Zoom Suave */}
      <div className="relative h-52 sm:h-56 w-full bg-gradient-to-b from-amber-50/30 to-slate-50/80 p-5 flex items-center justify-center overflow-hidden">
        <img
          src={product.imagem_url}
          alt={product.nome}
          className="max-h-full max-w-full object-contain p-1 group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-emerald-950/0 group-hover:bg-emerald-950/5 transition-colors duration-300 pointer-events-none" />
      </div>

      {/* Detalhes do Produto */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">
              {product.categoria?.nome || 'PET COSTELINHA'}
            </span>
            <span className="text-[10px] text-emerald-800 font-extrabold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Garantido
            </span>
          </div>

          <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors min-h-[2.5rem]">
            {product.nome}
          </h3>

          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 font-normal leading-relaxed">
            {product.descricao}
          </p>

          <div className="flex items-center gap-1 mt-2.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 stroke-[1.5]" />
            ))}
            <span className="text-[10px] text-slate-500 font-extrabold ml-1.5">(5.0)</span>
          </div>
        </div>

        {/* Preço e Botão CTA */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">No PIX</span>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(product.preco_venda)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.estoque === 0}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-xs transition-all duration-200 shadow-md active:scale-95 cursor-pointer uppercase tracking-wider ${
              product.estoque === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : added
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/25 hover:shadow-orange-600/40'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" /> Adicionado ao Carrinho!
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" /> Adicionar ao Carrinho
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
