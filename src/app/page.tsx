'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero3DFlip } from '@/components/Hero3DFlip';
import { ManifestoScroll } from '@/components/ManifestoScroll';
import { JourneyScroll } from '@/components/JourneyScroll';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductCard, ProductType } from '@/components/ProductCard';
import { ProductDetailsModal } from '@/components/ProductDetailsModal';
import { CartDrawer, CartItem } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { ServicesSection } from '@/components/ServicesSection';
import { Footer } from '@/components/Footer';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Toast, ToastProps } from '@/components/ui/Toast';
import { PackageX, ChevronDown, Sparkles } from 'lucide-react';

export default function StorefrontHomePage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Limite de visualização inicial (8 produtos para a página não ficar extensa)
  const [visibleLimit, setVisibleLimit] = useState(8);

  // Modal de Detalhes do Produto
  const [selectedProductDetails, setSelectedProductDetails] = useState<ProductType | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Toast System
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    async function loadData() {
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
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddToCart = (product: ProductType, quantity: number = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { product, quantity }];
    });

    showToast(`${quantity}x ${product.nome} adicionado ao seu carrinho.`, 'success');
  };

  const handleOpenDetails = (product: ProductType) => {
    setSelectedProductDetails(product);
    setIsDetailsOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (productId: string) => {
    const prod = cart.find((i) => i.product.id === productId);
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    if (prod) {
      showToast(`${prod.product.nome} removido do carrinho.`, 'info');
    }
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Filtragem
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory
      ? prod.categoria?.slug === selectedCategory
      : true;

    const matchesSearch = searchTerm
      ? prod.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return matchesCategory && matchesSearch;
  });

  // Produtos visíveis com limite inicial de 8 itens
  const displayedProducts = filteredProducts.slice(0, visibleLimit);
  const hasMoreProducts = filteredProducts.length > visibleLimit;

  const totalCartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>

      {/* Header Bar */}
      <Header
        cartCount={totalCartItemsCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={(term) => {
          setSearchTerm(term);
          setVisibleLimit(8);
        }}
      />

      <main className="flex-1">
        {/* SEÇÃO 1: HERO 3D CARD FLIP */}
        <Hero3DFlip />

        {/* SEÇÃO 2: MANIFESTO & CUIDADO */}
        <ManifestoScroll />

        {/* SEÇÃO 3: JORNADA DO CLIENTE */}
        <JourneyScroll />

        {/* SEÇÃO 4: CATÁLOGO DE PRODUTOS RESTAURADO COM VISUALIZAÇÃO LIMITADA E "VEJA MAIS" */}
        <div id="catalogo" className="pt-10">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setVisibleLimit(8);
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-orange-600 uppercase block font-semibold">
                  [ PRODUTOS DA LOJA FISICA E ONLINE ]
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  Catálogo Oficial ({filteredProducts.length})
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 my-6 space-y-2">
                <PackageX className="w-10 h-10 text-slate-400 mx-auto stroke-[1.5]" />
                <h3 className="font-bold text-slate-800 text-sm">Nenhum produto localizado</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Não encontramos itens correspondentes à busca. Tente buscar por outros termos.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSearchTerm('');
                    setVisibleLimit(8);
                  }}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Grade de 8 Produtos Iniciais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onOpenDetails={handleOpenDetails}
                    />
                  ))}
                </div>

                {/* BOTÃO PROEMINENTE "VEJA MAIS PRODUTOS" */}
                {hasMoreProducts && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => setVisibleLimit((prev) => prev + 12)}
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-2xl shadow-md transition-all active:scale-98"
                    >
                      Veja Mais Produtos (+{filteredProducts.length - displayedProducts.length})
                      <ChevronDown className="w-4 h-4 text-orange-400 stroke-[2]" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SEÇÃO 5: SERVIÇOS & INFORMAÇÕES DA LOJA */}
        <ServicesSection />
      </main>

      {/* Modal de Detalhes do Produto */}
      <ProductDetailsModal
        product={selectedProductDetails}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onClearCart={handleClearCart}
        onShowToast={showToast}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
