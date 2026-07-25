'use client';

import React, { useState } from 'react';
import { ProductType } from '@/components/ProductCard';
import { X, ShoppingBag, Check, ShieldCheck, Truck, Star, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/masks';

interface ProductDetailsModalProps {
  product: ProductType | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: ProductType, quantity: number) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 text-slate-900 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          
          {/* Imagem do Produto Ampliada */}
          <div className="relative aspect-square w-full bg-slate-50 rounded-2xl border border-slate-100 p-6 flex items-center justify-center overflow-hidden">
            <img
              src={product.imagem_url}
              alt={product.nome}
              className="w-full h-full object-contain"
            />
            {product.destaque && (
              <span className="absolute top-3 left-3 bg-slate-900 text-orange-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md uppercase">
                [ DESTAQUE ]
              </span>
            )}
          </div>

          {/* Especificações & Compra */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
                {product.categoria?.nome || 'LOJA PET COSTELINHA'}
              </span>

              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                {product.nome}
              </h2>

              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 stroke-[1.5]" />
                ))}
                <span className="text-xs text-slate-500 font-medium ml-1">5.0 (Avaliações de Clientes)</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {product.descricao}
            </p>

            <div className="space-y-1 py-2 border-y border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Preço à Vista</span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {formatCurrency(product.preco_venda)}
              </div>
            </div>

            {/* Seletor de Quantidade */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-700">Quantidade:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold transition-colors"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[1.5]" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
                </button>
              </div>
            </div>

            {/* Botão Adicionar ao Carrinho */}
            <button
              onClick={handleAdd}
              disabled={product.estoque === 0}
              className={`w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-98 ${
                product.estoque === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : added
                  ? 'bg-emerald-700 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 stroke-[2]" /> Adicionado ao Carrinho!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 stroke-[1.5]" /> Adicionar ao Carrinho • {formatCurrency(Number(product.preco_venda) * quantity)}
                </>
              )}
            </button>

            {/* Garantias */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[1.5]" /> Produto 100% Original
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-orange-600 stroke-[1.5]" /> Pronta Entrega
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
