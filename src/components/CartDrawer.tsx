'use client';

import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { ProductType } from './ProductCard';
import { formatCurrency } from '@/lib/masks';

export interface CartItem {
  product: ProductType;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
}) => {
  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => {
    const price = typeof item.product.preco_venda === 'string' ? parseFloat(item.product.preco_venda) : item.product.preco_venda;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400 stroke-[1.5]" />
              <h2 className="text-sm font-bold text-white">
                Carrinho de Compras ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Fechar Carrinho"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 stroke-[1.5]" />
                <p className="font-semibold text-xs text-slate-700">Seu carrinho está vazio</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Navegue pelas categorias e adicione produtos para prosseguir.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Fechar Janela
                </button>
              </div>
            ) : (
              cart.map(({ product, quantity }) => {
                const price = typeof product.preco_venda === 'string' ? parseFloat(product.preco_venda) : product.preco_venda;
                return (
                  <div
                    key={product.id}
                    className="flex gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl relative"
                  >
                    <img
                      src={product.imagem_url}
                      alt={product.nome}
                      className="w-14 h-14 object-contain bg-white p-1 rounded-lg border border-slate-200"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="pr-6">
                        <h4 className="font-semibold text-xs text-slate-900 line-clamp-1">
                          {product.nome}
                        </h4>
                        <span className="text-xs font-bold text-slate-700">
                          {formatCurrency(price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-0.5">
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                            className="p-0.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                          >
                            <Minus className="w-3 h-3 stroke-[1.5]" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 w-4 text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            className="p-0.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                          >
                            <Plus className="w-3 h-3 stroke-[1.5]" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-slate-900">
                          {formatCurrency(price * quantity)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Summary */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2.5">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                  <span>Frete Local Express</span>
                  <span>GRÁTIS</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Valor Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[1.5]" />
                <span>Emissão de Nota Fiscal Eletrônica (NF-e)</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={onClose}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" /> Fechar
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenCheckout();
                  }}
                  className="col-span-2 bg-slate-900 text-white hover:bg-slate-800 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                >
                  Checkout <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
