'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductCard, ProductType } from '@/components/ProductCard';
import { ProductDetailsModal } from '@/components/ProductDetailsModal';
import { CartDrawer, CartItem } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { CustomerAuthModal } from '@/components/CustomerAuthModal';
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
  const [visibleLimit, setVisibleLimit] = useState(8);

  // Modal de Detalhes do Produto
  const [selectedProductDetails, setSelectedProductDetails] = useState<ProductType | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sessão do Usuário
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Toast System
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Carregar usuário logado do localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {}
  }, []);

  // 2. Carregar carrinho salvo no localStorage ao iniciar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('pet_costelinha_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
        }
      }
    } catch (err) {
      console.error('Erro ao ler carrinho do localStorage:', err);
    }
  }, []);

  // 3. Persistir carrinho no localStorage sempre que houver alteração
  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem('pet_costelinha_cart', JSON.stringify(cart));
      } else {
        localStorage.removeItem('pet_costelinha_cart');
      }
    } catch (err) {
      console.error('Erro ao salvar carrinho no localStorage:', err);
    }
  }, [cart]);

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
    try {
      localStorage.removeItem('pet_costelinha_cart');
    } catch (err) {}
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    showToast('Você saiu da sua conta.', 'info');
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

  const displayedProducts = filteredProducts.slice(0, visibleLimit);
  const hasMoreProducts = filteredProducts.length > visibleLimit;

  const totalCartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>

      {/* HEADER PRINCIPAL ESTILO FIGMA */}
      <Header
        cartCount={totalCartItemsCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={(term) => {
          setSearchTerm(term);
          setVisibleLimit(8);
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {/* SEÇÃO 1: HERO BANNER (FIGMA SPLIT GRID) */}
        <HeroBanner />

        {/* SEÇÃO 2: FILTRO DE CATEGORIAS (FIGMA PILLS CARDS) */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setVisibleLimit(8);
          }}
        />

        {/* SEÇÃO 3: GRADE DE PRODUTOS DESTACADOS (FIGMA PRODUCT GRID) */}
        <div id="catalogo" className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <span className="text-[10px] font-black tracking-widest text-amber-600 uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Produtos Selecionados
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Produtos Recomendados para seu Pet ({filteredProducts.length})
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-500 my-6 space-y-3 shadow-xs">
              <PackageX className="w-12 h-12 text-slate-400 mx-auto stroke-[1.5]" />
              <h3 className="font-extrabold text-slate-800 text-base">Nenhum produto localizado</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Não encontramos itens correspondentes à sua busca. Tente buscar por outros termos ou limpar os filtros.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSearchTerm('');
                  setVisibleLimit(8);
                }}
                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Grade de Produtos Estilo Figma */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                <div className="text-center pt-6">
                  <button
                    onClick={() => setVisibleLimit((prev) => prev + 12)}
                    className="inline-flex items-center gap-2 bg-emerald-950 hover:bg-emerald-900 text-amber-400 font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer border border-amber-400/30"
                  >
                    Veja Mais Produtos (+{filteredProducts.length - displayedProducts.length})
                    <ChevronDown className="w-4 h-4 text-amber-400 stroke-[2.5]" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SEÇÃO 4: DIFERENCIAIS E SERVIÇOS (FIGMA BENEFIT CARDS) */}
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

      {/* Modal de Autenticação / Login / Cadastro de Clientes */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Bem-vindo(a), ${user.nome}!`, 'success');
        }}
      />

      {/* RODAPÉ E-COMMERCE ESTILO FIGMA */}
      <Footer />
    </div>
  );
}
