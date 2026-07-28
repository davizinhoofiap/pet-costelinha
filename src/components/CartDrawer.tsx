'use client';

import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
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
    <div className="fixed inset-0 z-[9999] overflow-hidden font-sans">
      {/* Backdrop com blur escuro */}
      <div
        className="absolute inset-0 bg-emerald-950/70 backdrop-blur-xs transition-opacity cursor-pointer z-[9999]"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-[10000]">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between relative border-l border-slate-200">
          
          {/* Header Fixo Escuro com Botão X Chamativo */}
          <div className="p-4 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900/80 sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-amber-500 text-emerald-950 rounded-xl flex items-center justify-center font-black">
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xs font-black text-white uppercase tracking-wider">
                  Carrinho de Compras
                </h2>
                <p className="text-[10px] text-amber-400 font-bold">
                  {cart.reduce((a, b) => a + b.quantity, 0)} {cart.reduce((a, b) => a + b.quantity, 0) === 1 ? 'item selecionado' : 'itens selecionados'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-orange-600 hover:bg-orange-500 text-white p-2 rounded-full transition-transform hover:scale-110 cursor-pointer border-2 border-white shadow-lg shrink-0 flex items-center justify-center"
              aria-label="Fechar Carrinho"
              title="Fechar"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          {/* Lista de Produtos */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12 space-y-3">
                <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-600 shadow-inner">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <p className="font-extrabold text-sm text-slate-800">Seu carrinho está vazio</p>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Explore nossos medicamentos, rações premium e itens de cuidado para seu pet.
                </p>
              </div>
            ) : (
              cart.map(({ product, quantity }) => {
                const price = typeof product.preco_venda === 'string' ? parseFloat(product.preco_venda) : product.preco_venda;
                return (
                  <div
                    key={product.id}
                    className="flex gap-3.5 p-3.5 bg-white border border-slate-200/90 rounded-2xl relative shadow-xs hover:border-amber-400/60 transition-all"
                  >
                    <img
                      src={product.imagem_url}
                      alt={product.nome}
                      className="w-16 h-16 object-contain bg-slate-50 p-1.5 rounded-xl border border-slate-200/80 shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="pr-6">
                        <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">
                          {product.nome}
                        </h4>
                        <span className="text-xs font-black text-amber-600">
                          {formatCurrency(price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200/80 rounded-xl px-2.5 py-1">
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                            className="p-0.5 text-slate-600 hover:text-slate-900 cursor-pointer font-bold"
                          >
                            <Minus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                          <span className="text-xs font-black text-slate-900 w-4 text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            className="p-0.5 text-slate-600 hover:text-slate-900 cursor-pointer font-bold"
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>

                        <span className="text-xs font-black text-slate-900">
                          {formatCurrency(price * quantity)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                      title="Remover item"
                    >
                      <Trash2 className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Resumo do Pedido Fixo na Parte Inferior */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3 shadow-lg">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} itens)</span>
                  <span className="font-bold text-slate-900">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-extrabold flex items-center gap-1">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Entrega Expressa
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-black">
                    GRÁTIS
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Estimado</span>
                  <span className="text-emerald-700 font-black text-base">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2]" />
                <span className="font-semibold">Compra Segura e Emissão de Nota Fiscal (NF-e)</span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenCheckout();
                }}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-3 rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
              >
                Avançar para Checkout PIX
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
